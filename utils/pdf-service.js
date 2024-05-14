import PDFDocument from 'pdfkit-table';
import fs from 'fs';
import https from 'https';

const buildPDF = async (dataCallback, endCallback, team) => {
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

export { buildPDF };
