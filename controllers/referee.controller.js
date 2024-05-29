import Referee from '../models/referee.model.js';
import sharp from 'sharp';
import { deleteImageFromS3, uploadImageToS3 } from '../utils/s3Utils.js';
import Match from '../models/match.model.js';
import { buildMatchDetailsPDF } from '../utils/pdf-service.js';
import xlsx from 'node-xlsx';

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
} from 'docx';

export const addReferee = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      const existedReferee = await Referee.findOne({ user: req.body.user });
      if (existedReferee) {
        const updatedReferee = await Referee.findOneAndUpdate(
          { user: req.body.user },
          { ...req.body },
          { new: true }
        );
        return res.status(200).json(updatedReferee);
      }
      const newReferee = new Referee({
        ...req.body,
      });
      await newReferee.save();
      return res.status(201).json(newReferee);
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 200, height: 200, fit: 'cover' })
      .toBuffer();

    const photoName = await uploadImageToS3(buffer, req.file.mimetype);
    const existedReferee = await Referee.findOne({ user: req.body.user });
    if (existedReferee) {
      existedReferee.photo
        ? await deleteImageFromS3(existedReferee.photo)
        : null;

      const updatedReferee = await Referee.findOneAndUpdate(
        { user: req.body.user },
        { ...req.body, photo: photoName },
        { new: true }
      );
      return res.status(200).json(updatedReferee);
    }
    const newReferee = new Referee({
      ...req.body,
      photo: photoName,
    });
    await newReferee.save();
    res.status(201).json(newReferee);
  } catch (error) {
    next(error);
  }
};

export const getRefereeByUserId = async (req, res, next) => {
  try {
    const referee = await Referee.findOne({ user: req.params.id });
    if (!referee) {
      return res.status(404).json({ success: false, message: 'Not found!' });
    }

    if (referee.photo) {
      referee.imageUrl =
        'https://d3awt09vrts30h.cloudfront.net/' + referee.photo;
    } else {
      referee.imageUrl = null;
    }

    referee.save();

    res.status(200).json(referee);
  } catch (error) {
    next(error);
  }
};

export const getRefereeById = async (req, res, next) => {
  try {
    const referee = await Referee.findById(req.params.id).populate(
      'nationality',
      'name'
    );
    if (!referee) {
      return res.status(404).json({ success: false, message: 'Not found!' });
    }

    if (referee.photo) {
      referee.imageUrl =
        'https://d3awt09vrts30h.cloudfront.net/' + referee.photo;
    } else {
      referee.imageUrl = null;
    }

    referee.save();

    res.status(200).json(referee);
  } catch (error) {
    next(error);
  }
};

export const getAllReferees = async (req, res, next) => {
  try {
    const referees = await Referee.find();
    if (!referees) {
      return res.status(404).json({ success: false, message: 'Not found!' });
    }

    referees.forEach((referee) => {
      if (referee.photo) {
        referee.imageUrl =
          'https://d3awt09vrts30h.cloudfront.net/' + referee.photo;
      } else {
        referee.imageUrl = null;
      }

      referee.save();
    });

    res.status(200).json(referees);
  } catch (error) {
    next(error);
  }
};

export const assignRefereesToMatch = async (req, res, next) => {
  try {
    const { mainReferee, firstAssistantReferee, secondAssistantReferee } =
      req.body;
    const matchId = req.params.id;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const matchesInSameRound = await Match.find({
      round: match.round,
      _id: { $ne: matchId },
    });

    const threeHoursInMilliseconds = 3 * 60 * 60 * 1000;

    for (const otherMatch of matchesInSameRound) {
      const matchDate = new Date(match.date);
      const otherMatchDate = new Date(otherMatch.date);

      if (
        Math.abs(matchDate - otherMatchDate) < threeHoursInMilliseconds &&
        (otherMatch.mainReferee === mainReferee ||
          otherMatch.mainReferee === firstAssistantReferee ||
          otherMatch.mainReferee === secondAssistantReferee ||
          otherMatch.firstAssistantReferee === mainReferee ||
          otherMatch.firstAssistantReferee === firstAssistantReferee ||
          otherMatch.firstAssistantReferee === secondAssistantReferee ||
          otherMatch.secondAssistantReferee === mainReferee ||
          otherMatch.secondAssistantReferee === firstAssistantReferee ||
          otherMatch.secondAssistantReferee === secondAssistantReferee)
      ) {
        return res.status(400).json({
          error:
            'Referees are already assigned to another match in the same round within 3 hours.',
        });
      }
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      {
        mainReferee,
        firstAssistantReferee,
        secondAssistantReferee,
      },
      { new: true }
    );

    res.status(200).json(updatedMatch);
  } catch (error) {
    next(error);
  }
};

export const getMatchDetailsPDF = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('mainReferee', 'name surname -_id')
      .populate('firstAssistantReferee', 'name surname -_id')
      .populate('secondAssistantReferee', 'name surname -_id')
      .populate('round', 'name -_id')
      .populate('season', 'name -_id')
      .populate('league', 'name -_id')
      .populate({
        path: 'homeTeam',
        populate: [
          {
            path: 'players',
            select: 'name surname age number -_id',
            model: 'Player',
          },
          {
            path: 'coach',
            select: 'name surname -_id',
            model: 'Coach',
          },
          {
            path: 'stadium',
            select: 'name -_id',
            model: 'Stadium',
          },
        ],
      })
      .populate({
        path: 'awayTeam',
        populate: [
          {
            path: 'players',
            select: 'name surname age number -_id',
            model: 'Player',
          },
          {
            path: 'coach',
            select: 'name surname -_id',
            model: 'Coach',
          },
        ],
      });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const sanitizedMatchName = sanitizeFileName(
      match?.homeTeam?.name + ' vs ' + match?.awayTeam?.name
    );

    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${sanitizedMatchName}.pdf`,
    });

    match.homeTeam.name = sanitizeFileName(match?.homeTeam?.name);
    match.awayTeam.name = sanitizeFileName(match?.awayTeam?.name);

    buildMatchDetailsPDF(
      (chunk) => stream.write(chunk),
      () => stream.end(),
      match
    );
  } catch (error) {
    next(error);
  }
};

const polishToEnglish = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ż: 'z',
  ź: 'z',
};

const sanitizeFileName = (fileName) => {
  return fileName.replace(
    /[ąćęłńóśżź]/g,
    (match) => polishToEnglish[match] || match
  );
};

export const getMatchDetailsXlsx = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('mainReferee', 'name surname -_id')
      .populate('firstAssistantReferee', 'name surname -_id')
      .populate('secondAssistantReferee', 'name surname -_id')
      .populate('round', 'name -_id')
      .populate('season', 'name -_id')
      .populate('league', 'name -_id')
      .populate({
        path: 'homeTeam',
        populate: [
          {
            path: 'players',
            select:
              'name surname age number goals assists yellowCards redCards ownGoals minutesPlayed -_id',
            model: 'Player',
          },
          {
            path: 'coach',
            select: 'name surname -_id',
            model: 'Coach',
          },
          {
            path: 'stadium',
            select: 'name -_id',
            model: 'Stadium',
          },
        ],
      })
      .populate({
        path: 'awayTeam',
        populate: [
          {
            path: 'players',
            select:
              'name surname age number goals assists yellowCards redCards ownGoals minutesPlayed -_id',
            model: 'Player',
          },
          {
            path: 'coach',
            select: 'name surname -_id',
            model: 'Coach',
          },
        ],
      });

    if (match) {
      const homeTeamPlayers = match?.homeTeam?.players.map((player) => [
        player.name,
        player.surname,
        player.age,
        player.number,
      ]);

      const awayTeamPlayers = match?.awayTeam?.players.map((player) => [
        player.name,
        player.surname,
        player.age,
        player.number,
      ]);

      const homeTeamData = [
        ['Home Team', match?.homeTeam?.name],
        [
          'Coach',
          `${match?.homeTeam?.coach?.name} ${match?.homeTeam?.coach?.surname}`,
        ],
        ['Stadium', match?.homeTeam?.stadium?.name],
        [],
        [
          'Name',
          'Surname',
          'Age',
          'Number',
          'Goals',
          'Assists',
          'Yellow Cards',
          'Red Cards',
          'Own Goals',
          'Minutes Played',
        ],
        ...homeTeamPlayers,
      ];

      const awayTeamData = [
        ['Away Team', match?.awayTeam?.name],
        [
          'Coach',
          `${match?.awayTeam?.coach?.name} ${match?.awayTeam?.coach?.surname}`,
        ],
        [],
        [
          'Name',
          'Surname',
          'Age',
          'Number',
          'Goals',
          'Assists',
          'Yellow Cards',
          'Red Cards',
          'Own Goals',
          'Minutes Played',
        ],
        ...awayTeamPlayers,
      ];

      const matchDetails = [
        ['League', match?.league?.name],
        ['Season', match?.season?.name],
        ['Round', match?.round?.name],
        [
          'Main Referee',
          `${match?.mainReferee?.name} ${match?.mainReferee?.surname}`,
        ],
        [
          'First Assistant Referee',
          `${match?.firstAssistantReferee?.name} ${match?.firstAssistantReferee?.surname}`,
        ],
        [
          'Second Assistant Referee',
          `${match?.secondAssistantReferee?.name} ${match?.secondAssistantReferee?.surname}`,
        ],
        [],
      ];

      const data = [
        { name: 'Match Details', data: matchDetails },
        { name: 'Home Team', data: homeTeamData },
        { name: 'Away Team', data: awayTeamData },
      ];

      // Create the Excel buffer
      const buffer = xlsx.build(data);

      res.writeHead(200, {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=Match_Details.xlsx`,
      });

      res.end(buffer, 'binary');
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const getMatchDetailsDocx = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('mainReferee', 'name surname -_id')
      .populate('firstAssistantReferee', 'name surname -_id')
      .populate('secondAssistantReferee', 'name surname -_id')
      .populate('round', 'name -_id')
      .populate('season', 'name -_id')
      .populate('league', 'name -_id')
      .populate({
        path: 'homeTeam',
        populate: [
          {
            path: 'players',
            select: 'name surname age number -_id',
            model: 'Player',
          },
          {
            path: 'coach',
            select: 'name surname -_id',
            model: 'Coach',
          },
          {
            path: 'stadium',
            select: 'name -_id',
            model: 'Stadium',
          },
        ],
      })
      .populate({
        path: 'awayTeam',
        populate: [
          {
            path: 'players',
            select: 'name surname age number -_id',
            model: 'Player',
          },
          {
            path: 'coach',
            select: 'name surname -_id',
            model: 'Coach',
          },
        ],
      });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const createPlayerTable = (title, players) => {
      const tableRows = players.map(
        (player) =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(player.name)],
                width: { size: 2000, type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph(player.surname)],
                width: { size: 2000, type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph(String(player.age))],
                width: { size: 1000, type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph(String(player.number))],
                width: { size: 1000, type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph(String())],
                width: { size: 1000, type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph(String())],
                width: { size: 1000, type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph(String())],
                width: { size: 1000, type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph(String())],
                width: { size: 1000, type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph(String())],
                width: { size: 1000, type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph(String())],
                width: { size: 2000, type: WidthType.DXA },
              }),
            ],
          })
      );

      return [
        new Paragraph({
          children: [
            new TextRun({ text: title, bold: true, size: 28, color: '0000FF' }),
          ],
          spacing: { after: 200 },
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph('Name')],
                  width: { size: 2000, type: WidthType.DXA },
                }),
                new TableCell({
                  children: [new Paragraph('Surname')],
                  width: { size: 2000, type: WidthType.DXA },
                }),
                new TableCell({
                  children: [new Paragraph('Age')],
                  width: { size: 1000, type: WidthType.DXA },
                }),
                new TableCell({
                  children: [new Paragraph('Number')],
                  width: { size: 1000, type: WidthType.DXA },
                }),
                new TableCell({
                  children: [new Paragraph('Goals')],
                  width: { size: 1000, type: WidthType.DXA },
                }),
                new TableCell({
                  children: [new Paragraph('Assists')],
                  width: { size: 1000, type: WidthType.DXA },
                }),
                new TableCell({
                  children: [new Paragraph('Yellow Cards')],
                  width: { size: 1000, type: WidthType.DXA },
                }),
                new TableCell({
                  children: [new Paragraph('Red Cards')],
                  width: { size: 1000, type: WidthType.DXA },
                }),
                new TableCell({
                  children: [new Paragraph('Own Goals')],
                  width: { size: 1000, type: WidthType.DXA },
                }),
                new TableCell({
                  children: [new Paragraph('Minutes Played')],
                  width: { size: 2000, type: WidthType.DXA },
                }),
              ],
            }),
            ...tableRows,
          ],
        }),
      ];
    };

    const homeTeamPlayers = match?.homeTeam?.players.map((player) => ({
      name: player.name,
      surname: player.surname,
      age: player.age,
      number: player.number,
    }));

    const awayTeamPlayers = match?.awayTeam?.players.map((player) => ({
      name: player.name,
      surname: player.surname,
      age: player.age,
      number: player.number,
    }));

    const homeTeamTableData = createPlayerTable(
      match?.homeTeam?.name + ' Team',
      homeTeamPlayers
    );
    const awayTeamTableData = createPlayerTable(
      match?.awayTeam?.name + ' Team',
      awayTeamPlayers
    );

    const matchDetails = [
      new Paragraph({
        children: [
          new TextRun({ text: 'Match Details', bold: true, size: 36 }),
        ],
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: `League: ${match?.league?.name}`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Season: ${match?.season?.name}`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Round: ${match?.round?.name}`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Main Referee: ${match?.mainReferee?.name} ${match?.mainReferee?.surname}`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `First Assistant Referee: ${match?.firstAssistantReferee?.name} ${match?.firstAssistantReferee?.surname}`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Second Assistant Referee: ${match?.secondAssistantReferee?.name} ${match?.secondAssistantReferee?.surname}`,
        spacing: { after: 400 },
      }),
      ...homeTeamTableData,
      new Paragraph({ text: ' ', spacing: { after: 400 } }),
      ...awayTeamTableData,
    ];

    const doc = new Document({
      sections: [{ children: matchDetails }],
    });

    const buffer = await Packer.toBuffer(doc);

    res.writeHead(200, {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=Match_Details.docx`,
    });

    res.end(buffer);
  } catch (error) {
    next(error);
  }
};
