import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const generatePurchaseOrderPDF = async (po) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    
    // Set up fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const smallFontSize = 10;
    let yPosition = height - 50;
    
    // Function to add text with line break
    const addText = (text, size = fontSize, x = 50, isBold = false) => {
      page.drawText(text, {
        x,
        y: yPosition,
        size,
        font,
      });
      yPosition -= size + 5;
    };
    
    // Add title
    page.drawText('PURCHASE ORDER', {
      x: 50,
      y: yPosition,
      size: 20,
      font,
      color: rgb(0.1, 0.1, 0.5),
    });
    
    yPosition -= 40;
    
    // Add PO details
    const poNumber = po.poNumber || po.po_number || po.id || 'N/A';
    
    // PO Header
    addText(`PO Number: ${poNumber}`);
    addText(`Date: ${po.createdAt || new Date().toISOString().split('T')[0]}`);
    addText(`Status: ${po.status || 'N/A'}`);
    
    // Add supplier info if available
    if (po.supplier) {
      yPosition -= 20;
      addText(`Supplier: ${po.supplier.name || 'N/A'}`);
    }
    
    // Add a line separator
    yPosition -= 20;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    yPosition -= 30;
    
    // Add items table header
    addText('ITEMS', 14, 50);
    yPosition -= 10;
    
    // Draw table headers
    page.drawText('Item', { x: 50, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Qty', { x: 300, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Price', { x: 350, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Total', { x: 450, y: yPosition, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    yPosition -= 25;
    
    // Draw items
    if (po.items && po.items.length > 0) {
      po.items.forEach((item) => {
        if (yPosition < 100) {
          // Add new page if we're running out of space
          page.drawText('Continued...', { x: 50, y: 50, size: fontSize, font });
          pdfDoc.addPage([600, 800]);
          yPosition = 780;
        }
        
        // Item name (with word wrap)
        const itemName = item.name || 'Unnamed Item';
        page.drawText(itemName, { 
          x: 50, 
          y: yPosition, 
          size: fontSize, 
          font,
          maxWidth: 240,
          lineHeight: 16
        });
        
        // Quantity
        page.drawText(String(item.quantity || 0), { 
          x: 300, 
          y: yPosition, 
          size: fontSize, 
          font 
        });
        
        // Price
        const price = item.price || item.unitPrice || 0;
        page.drawText(`$${price.toFixed(2)}`, { 
          x: 350, 
          y: yPosition, 
          size: fontSize, 
          font 
        });
        
        // Total
        const total = (item.quantity || 0) * price;
        page.drawText(`$${total.toFixed(2)}`, { 
          x: 450, 
          y: yPosition, 
          size: fontSize, 
          font 
        });
        
        yPosition -= 20;
      });
      
      // Add grand total
      yPosition -= 20;
      const grandTotal = po.items.reduce((sum, item) => {
        const price = item.price || item.unitPrice || 0;
        return sum + ((item.quantity || 0) * price);
      }, 0);
      
      page.drawText('Grand Total:', { 
        x: 350, 
        y: yPosition, 
        size: fontSize + 2, 
        font,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      page.drawText(`$${grandTotal.toFixed(2)}`, { 
        x: 450, 
        y: yPosition, 
        size: fontSize + 2, 
        font,
        color: rgb(0.2, 0.2, 0.2)
      });
    } else {
      addText('No items in this purchase order.');
    }
    
    // Add footer
    yPosition = 50;
    page.drawLine({
      start: { x: 50, y: yPosition + 10 },
      end: { x: width - 50, y: yPosition + 10 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    addText('Thank you for your business!', fontSize - 2, 50);
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, `PO-${poNumber}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
