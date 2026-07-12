const fs = require('fs');
const path = require('path');
const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType, 
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  NumberFormat
} = require('docx');

// Đường dẫn file nguồn và file đích
const srcPath = 'C:\\Users\\pinkc\\.gemini\\antigravity\\brain\\e598e4dd-df4c-47c8-a32e-9dd7d3e55020\\project_report.md';
const destPath = 'C:\\Users\\pinkc\\Downloads\\Scarlett_Cake_Shop_Bao_cao_chi_tiet_formal.docx';

console.log('--- KHỞI ĐỘNG CHUYỂN ĐỔI BÁO CÁO SANG FILE WORD (.DOCX) ---');
console.log('Nguồn:', srcPath);
console.log('Đích:', destPath);

if (!fs.existsSync(srcPath)) {
  console.error('Lỗi: Không tìm thấy file báo cáo markdown nguồn!');
  process.exit(1);
}

// Đọc toàn bộ nội dung markdown
const markdown = fs.readFileSync(srcPath, 'utf8');
const lines = markdown.split(/\r?\n/);

const docChildren = [];

// Helper: Định dạng TextRun chung
const createTextRun = (text, options = {}) => {
  return new TextRun({
    text: text,
    font: 'Segoe UI',
    size: options.size || 22, // 11pt
    color: options.color || '333333',
    bold: !!options.bold,
    italic: !!options.italic,
  });
};

let i = 0;
while (i < lines.length) {
  let line = lines[i];
  
  // 1. Xử lý H1, H2, H3, H4
  if (line.startsWith('# ')) {
    const text = line.replace('# ', '').trim();
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: text,
            font: 'Playfair Display',
            size: 48, // 24pt
            color: '6B1111',
            bold: true,
          })
        ]
      })
    );
    i++;
    continue;
  }
  
  if (line.startsWith('## ')) {
    const text = line.replace('## ', '').trim();
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 120 },
        children: [
          new TextRun({
            text: text,
            font: 'Segoe UI',
            size: 32, // 16pt
            color: '6B1111',
            bold: true,
          })
        ]
      })
    );
    i++;
    continue;
  }
  
  if (line.startsWith('### ')) {
    const text = line.replace('### ', '').trim();
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: text,
            font: 'Segoe UI',
            size: 26, // 13pt
            color: 'c59b27',
            bold: true,
          })
        ]
      })
    );
    i++;
    continue;
  }

  if (line.startsWith('#### ')) {
    const text = line.replace('#### ', '').trim();
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: text,
            font: 'Segoe UI',
            size: 22, // 11pt
            color: '2B201A',
            bold: true,
          })
        ]
      })
    );
    i++;
    continue;
  }

  // 2. Xử lý đường kẻ chia phần (---)
  if (line.trim() === '---') {
    // Thêm một đoạn trống có gạch dưới làm đường phân cách
    docChildren.push(
      new Paragraph({
        spacing: { before: 180, after: 180 },
        border: {
          bottom: {
            color: 'E0E0E0',
            space: 1,
            value: BorderStyle.SINGLE,
            size: 6,
          }
        },
        children: []
      })
    );
    i++;
    continue;
  }

  // 3. Xử lý khối Code (Mermaid hoặc JSON/SQL)
  if (line.trim().startsWith('```')) {
    const codeLines = [];
    i++; // Bỏ dòng ``` mở đầu
    while (i < lines.length && !lines[i].trim().startsWith('```')) {
      codeLines.push(lines[i]);
      i++;
    }
    i++; // Bỏ dòng ``` kết thúc
    
    // Tạo bảng 1 ô làm khung code block để có viền và nền xám đẹp mắt
    const codeBlockText = codeLines.join('\n');
    docChildren.push(
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        spacing: { before: 120, after: 120 },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: {
                  fill: 'F5F5F5',
                },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: 'E0E0E0' },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E0E0E0' },
                  left: { style: BorderStyle.SINGLE, size: 12, color: '6B1111' }, // Viền trái dày màu bordeaux
                  right: { style: BorderStyle.SINGLE, size: 4, color: 'E0E0E0' },
                },
                margins: {
                  top: 140,
                  bottom: 140,
                  left: 180,
                  right: 180,
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: codeBlockText,
                        font: 'Consolas',
                        size: 18, // 9pt
                        color: '444444',
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    );
    continue;
  }

  // 4. Xử lý bảng dữ liệu Markdown (| Cột 1 | Cột 2 |)
  if (line.trim().startsWith('|')) {
    const tableLines = [];
    // Gom tất cả các dòng bảng liên tiếp
    while (i < lines.length && lines[i].trim().startsWith('|')) {
      tableLines.push(lines[i].trim());
      i++;
    }
    
    // Phân tích các dòng thành cấu trúc Table Rows
    const docRows = [];
    let isHeader = true;
    
    for (const tline of tableLines) {
      // Bỏ qua dòng phân cách của markdown table (ví dụ: | :--- | :--- |)
      if (tline.includes('---') || tline.includes('-:')) {
        continue;
      }
      
      const cells = tline.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      docRows.push(
        new TableRow({
          children: cells.map(cellText => {
            return new TableCell({
              shading: isHeader ? { fill: '6B1111' } : { fill: 'FFFFFF' }, // Nền bordeaux cho header
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: 'E0E0E0' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E0E0E0' },
                left: { style: BorderStyle.SINGLE, size: 4, color: 'E0E0E0' },
                right: { style: BorderStyle.SINGLE, size: 4, color: 'E0E0E0' },
              },
              margins: {
                top: 100,
                bottom: 100,
                left: 140,
                right: 140,
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cellText,
                      font: 'Segoe UI',
                      size: 20, // 10pt
                      color: isHeader ? 'FFFFFF' : '333333', // Chữ trắng cho header
                      bold: isHeader,
                    })
                  ]
                })
              ]
            });
          })
        })
      );
      isHeader = false;
    }
    
    docChildren.push(
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        spacing: { before: 180, after: 180 },
        rows: docRows,
      })
    );
    continue;
  }

  // 5. Xử lý danh sách gạch đầu dòng (Bullet List / Star / Dash)
  if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
    const cleanText = line.replace(/^\s*[\*\-]\s+/, '').trim();
    docChildren.push(
      new Paragraph({
        bullet: {
          level: 0
        },
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: cleanText,
            font: 'Segoe UI',
            size: 22,
            color: '333333',
          })
        ]
      })
    );
    i++;
    continue;
  }

  // 6. Dòng trống hoặc đoạn văn bản thường
  if (line.trim() === '') {
    // Bỏ qua dòng trống liên tiếp
  } else {
    // Xử lý một số style cơ bản trong văn bản (ví dụ chữ đậm **chữ đậm**)
    const parts = [];
    const regex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(createTextRun(line.substring(lastIndex, match.index)));
      }
      parts.push(createTextRun(match[1], { bold: true }));
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < line.length) {
      parts.push(createTextRun(line.substring(lastIndex)));
    }

    docChildren.push(
      new Paragraph({
        spacing: { before: 100, after: 100 },
        lineSpacing: { line: 276, before: 100, after: 100 }, // Dãn dòng 1.15
        children: parts
      })
    );
  }
  
  i++;
}

// 7. Tạo Document hoàn chỉnh với Header và Footer
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch
            bottom: 1440,
            left: 1440,
            right: 1440,
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 120 },
              border: {
                bottom: { color: 'CCCCCC', space: 4, value: BorderStyle.SINGLE, size: 4 }
              },
              children: [
                new TextRun({
                  text: 'Báo cáo kỹ thuật chi tiết | Scarlett Cake Shop',
                  font: 'Segoe UI',
                  size: 16, // 8pt
                  color: '888888',
                  italic: true
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 120 },
              children: [
                new TextRun({
                  text: 'Trang ',
                  font: 'Segoe UI',
                  size: 18,
                  color: '888888'
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Segoe UI',
                  size: 18,
                  color: '888888',
                  bold: true
                }),
                new TextRun({
                  text: ' / ',
                  font: 'Segoe UI',
                  size: 18,
                  color: '888888'
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: 'Segoe UI',
                  size: 18,
                  color: '888888'
                })
              ]
            })
          ]
        })
      },
      children: docChildren,
    }
  ]
});

// Tạo thư mục đích nếu chưa tồn tại
const destDir = path.dirname(destPath);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Lưu file
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(destPath, buffer);
  console.log('\n================================================================');
  console.log('✓ CHUYỂN ĐỔI BÁO CÁO THÀNH CÔNG RỰC RỠ!');
  console.log('File Word đã lưu tại:', destPath);
  console.log('================================================================');
  process.exit(0);
}).catch((err) => {
  console.error('Lỗi khi biên dịch file Word:', err);
  process.exit(1);
});
