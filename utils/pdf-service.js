import PDFDocument from 'pdfkit-table';
import fs from 'fs';
import https from 'https';

const buildPDF = async (dataCallback, endCallback, team) => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  const image = team.logo;

  try {
    await downloadImage(image, '/frontendApiRest/api/utils/images/logo.png');
    const imageData = fs.readFileSync(
      '/frontendApiRest/api/utils/images/logo.png'
    );

    doc.font('Times-Roman');

    doc.fontSize(24).text(team.name, { align: 'center' }, 55);

    doc.image(imageData, 472.36, 30, {
      fit: [80, 80],
      align: 'center',
      valign: 'center',
    });

    doc.moveTo(47.64, 125).lineTo(550, 125);

    doc
      .font('Times-Bold')
      .fontSize(12)
      .text('League:', 47.64, 140)
      .font('Times-Roman')
      .text(team.league.name, 97.64, 140)
      .font('Times-Bold')
      .text('Coach:', 147.64, 140)
      .font('Times-Roman')
      .text(`${team.coach.name} ${team.coach.surname}`, 192.64, 140)
      .font('Times-Bold')
      .text('Stadium:', 287.64, 140)
      .font('Times-Roman')
      .text(team.stadium.name, 342.64, 140)
      .font('Times-Bold')
      .text('Country:', 427.64, 140)
      .font('Times-Roman')
      .text(team.country.name, 482.64, 140)
      .font('Times-Bold')
      .text('Founded:', 47.64, 165)
      .font('Times-Roman')
      .text(team.yearFounded, 100.64, 165);

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
      rows: team.players.map((player) => [
        player.name,
        player.surname,
        player.age,
        player.number,
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
      y: 200,
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
