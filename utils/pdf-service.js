import PDFDocument from 'pdfkit-table';
import fs from 'fs';
import https from 'https';

const buildTeamDetailsPDF = async (dataCallback, endCallback, team) => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  try {
    const image = 'https://d3awt09vrts30h.cloudfront.net/' + team?.logo;
    await downloadImage(image, './api/utils/images/logo.png');
    const imageData = fs.readFileSync('./api/utils/images/logo.png');

    const coachImage = fs.readFileSync('./api/utils/images/coach.png');

    const leagueImage = fs.readFileSync('./api/utils/images/league.png');

    const stadiumImage = fs.readFileSync('./api/utils/images/stadium.png');

    const countryImage = fs.readFileSync('./api/utils/images/country.png');

    const foundedImage = fs.readFileSync('./api/utils/images/founded.png');

    doc.font('Times-Roman');
    doc.fontSize(24).text(team.name, { align: 'center' }, 55);

    doc.image(imageData, 472.36, 30, {
      fit: [80, 80],
      align: 'center',
      valign: 'center',
    });

    doc.moveTo(47.64, 125).lineTo(550, 125);

    doc.fontSize(12).font('Times-Roman');

    doc
      .image(leagueImage, 47.64, 130, {
        fit: [30, 30],
        align: 'center',
        valign: 'center',
      })
      .font('Times-Bold')
      .text('League:', 87.64, 145)
      .font('Times-Roman')
      .text(team.league.name, 131.64, 145);

    // Coach
    doc
      .image(coachImage, 357.64, 130, {
        fit: [30, 30],
        align: 'center',
        valign: 'center',
      })
      .font('Times-Bold')
      .text('Coach:', 397.64, 145)
      .font('Times-Roman')
      .text(`${team.coach.name} ${team.coach.surname}`, 438.64, 145);

    // Stadium
    doc
      .image(stadiumImage, 47.64, 175, {
        fit: [30, 30],
        align: 'center',
        valign: 'center',
      })
      .font('Times-Bold')
      .text('Stadium:', 87.64, 190)
      .font('Times-Roman')
      .text(team.stadium.name, 138.64, 190);

    // Country
    doc
      .image(countryImage, 357.64, 175, {
        fit: [30, 30],
        align: 'center',
        valign: 'center',
      })
      .font('Times-Bold')
      .text('Country:', 397.64, 190)
      .font('Times-Roman')
      .text(team.country.name, 448.64, 190);

    // Founded
    doc
      .image(foundedImage, 47.64, 220, {
        fit: [30, 30],
        align: 'center',
        valign: 'center',
      })
      .font('Times-Bold')
      .text('Founded:', 87.64, 235)
      .font('Times-Roman')
      .text(team.yearFounded, 139.64, 235);

    // table
    const table = {
      title: 'Players',
      subtitle: 'List of players',
      headers: [
        { label: 'Name', align: 'center' },
        { label: 'Surname', align: 'center' },
        { label: 'Age', align: 'center' },
        { label: 'Number', align: 'center' },
      ],
      rows: team?.players?.map((player) => [
        player?.name,
        player?.surname,
        player?.age,
        player?.number,
      ]),
    };

    // or columnsSize
    doc.table(table, {
      columnsSize: [150, 150, 100, 100],
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(13),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('Helvetica').fontSize(11);
        indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.1);
      },
      x: 47.64,
      y: 300,
    });

    doc.end();
  } catch (error) {
    console.error('Error building PDF:', error);
  }
};

const buildMatchDetailsPDF = async (dataCallback, endCallback, match) => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  const createTable = (title, players) => ({
    title: title + ' players',
    subtitle: 'List of players',
    headers: [
      { label: 'Name', align: 'center' },
      { label: 'Surname', align: 'center' },
      { label: 'Age', align: 'center' },
      { label: 'Number', align: 'center' },
      { label: 'Goals', align: 'center' },
      { label: 'Assists', align: 'center' },
      { label: 'Y.Card', align: 'center' },
      { label: 'R.Card', align: 'center' },
      { label: 'Own Goals', align: 'center' },
      { label: 'Minutes', align: 'center' },
    ],
    rows: players.map((player) => [
      player?.name,
      player?.surname,
      player?.age,
      player?.number,
      player?.goals,
      player?.assists,
      player?.yellowCards,
      player?.redCards,
      player?.ownGoals,
      player?.minutesPlayed,
    ]),
  });

  const renderTable = (table, yPosition) => {
    doc.table(table, {
      columnsSize: [70, 70, 50, 50, 40, 40, 40, 40, 40, 45],
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('Helvetica').fontSize(9);
        doc.lineWidth(0.5);
        if (indexColumn < table.headers.length) {
          doc
            .moveTo(rectCell.x + rectCell.width, rectCell.y)
            .lineTo(rectCell.x + rectCell.width, rectCell.y + rectCell.height)
            .stroke();
        }
      },

      x: 47.64,
      y: yPosition,
    });
  };

  try {
    const homeTeamImage =
      'https://d3awt09vrts30h.cloudfront.net/' + match?.homeTeam?.logo;
    await downloadImage(homeTeamImage, './api/utils/images/homeTeamLogo.png');
    const homeTeamImageData = fs.readFileSync(
      './api/utils/images/homeTeamLogo.png'
    );

    const awayTeamImage =
      'https://d3awt09vrts30h.cloudfront.net/' + match?.awayTeam?.logo;

    await downloadImage(awayTeamImage, './api/utils/images/awayTeamLogo.png');
    const awayTeamImageData = fs.readFileSync(
      './api/utils/images/awayTeamLogo.png'
    );

    doc.image(homeTeamImageData, 47.64, 30, {
      fit: [60, 60],
      align: 'center',
      valign: 'center',
    });

    doc.fontSize(14).font('Times-Bold').text(match?.homeTeam?.name, 140, 55);

    doc.fontSize(14).font('Times-Bold').text(':', 310, 55);

    doc.fontSize(14).font('Times-Bold').text(match?.awayTeam?.name, 360, 55);

    doc.image(awayTeamImageData, 490, 30, {
      fit: [60, 60],
      align: 'center',
      valign: 'center',
    });

    doc
      .fontSize(12)
      .font('Courier-Oblique')
      .text(
        new Date(match?.startDate).toLocaleString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        }),
        220,
        100
      );

    doc.moveTo(47.64, 125).lineTo(550, 125);

    doc.text(
      'Main Referee: ' +
        match?.mainReferee?.name +
        ' ' +
        match?.mainReferee?.surname,
      47.64,
      140
    );

    doc.text(
      'First Assistant: ' +
        match?.firstAssistantReferee?.name +
        ' ' +
        match?.firstAssistantReferee?.surname,
      47.64,
      170
    );

    doc.text(
      'Second Assistant: ' +
        match?.secondAssistantReferee?.name +
        ' ' +
        match?.secondAssistantReferee?.surname,
      47.64,
      200
    );

    doc.text('Stadium: ' + match?.homeTeam?.stadium?.name, 420, 140);

    doc.text('League: ' + match?.league?.name, 420, 170);

    doc.text(match?.season?.name, 420, 200);

    doc.text(
      'Coach: ' +
        match?.homeTeam?.coach?.name +
        ' ' +
        match?.homeTeam?.coach?.surname,
      390,
      270
    );

    const homeTeamTable = createTable(
      match?.homeTeam?.name,
      match?.homeTeam?.players
    );
    renderTable(homeTeamTable, 270);

    doc.addPage();

    doc
      .fontSize(12)
      .font('Courier-Oblique')
      .text(
        'Coach: ' +
          match?.awayTeam?.coach?.name +
          ' ' +
          match?.awayTeam?.coach?.surname,
        390,
        70
      );

    const awayTeamTable = createTable(
      match?.awayTeam?.name,
      match?.awayTeam?.players
    );
    renderTable(awayTeamTable, 70);

    doc.end();
  } catch (error) {
    console.error('Error building PDF:', error);
  }
};

const downloadImage = async (url, filePath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (error) => {
        fs.unlink(filePath, () => reject(error));
      });
  });
};

export { buildTeamDetailsPDF, buildMatchDetailsPDF };
