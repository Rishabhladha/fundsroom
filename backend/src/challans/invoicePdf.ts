import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Challan, ChallanItem } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// generateInvoicePdf
// Draws the invoice directly onto a PDFDocument and pipes it to the response.
// Uses pdfkit's draw-text-and-lines API — no headless browser needed.
// ─────────────────────────────────────────────────────────────────────────────

type ChallanWithCustomer = Challan & {
  customer_name: string;
  customer_mobile: string;
  customer_gst: string | null;
  customer_address: string | null;
  created_by_name: string;
};

export function generateInvoicePdf(
  challan: ChallanWithCustomer,
  items: ChallanItem[],
  res: Response
): void {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    info: {
      Title: `FreightLedger — ${challan.challan_number}`,
      Author: 'FreightLedger',
    },
  });

  doc.pipe(res);

  // ── Colors (matching FreightLedger palette) ─────────────────────────────
  const INK = '#12151B';
  const STEEL = '#2B3240';
  const AMBER = '#F2A93B';
  const GREEN = '#3F9967';
  const RUST = '#C4501F';

  const PAGE_W = doc.page.width - 80; // effective content width
  const LEFT = 40;

  // ── Header strip ─────────────────────────────────────────────────────────
  doc.rect(LEFT, 40, PAGE_W, 60).fill(INK);

  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor('#FFFFFF')
    .text('FREIGHTLEDGER', LEFT + 16, 56);

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#C7CCD6')
    .text('DISPATCH DOCKET / TAX INVOICE', LEFT + 16, 80);

  // Challan number (top-right, monospace style)
  doc
    .font('Courier-Bold')
    .fontSize(14)
    .fillColor(AMBER)
    .text(challan.challan_number, 0, 58, { align: 'right', width: PAGE_W + LEFT });

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#C7CCD6')
    .text(
      new Date(challan.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      }),
      0, 78, { align: 'right', width: PAGE_W + LEFT }
    );

  // ── Status stamp ──────────────────────────────────────────────────────────
  const statusColor =
    challan.status === 'CONFIRMED' ? GREEN :
    challan.status === 'CANCELLED' ? RUST : STEEL;

  doc
    .roundedRect(LEFT, 115, 100, 22, 3)
    .stroke(statusColor);
  doc
    .font('Courier-Bold')
    .fontSize(9)
    .fillColor(statusColor)
    .text(challan.status, LEFT, 121, { width: 100, align: 'center' });

  // ── Customer block ────────────────────────────────────────────────────────
  doc.moveDown(0.5);
  const billY = 145;

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(STEEL)
    .text('BILL TO', LEFT, billY);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(INK)
    .text(challan.customer_name, LEFT, billY + 12);

  doc
    .font('Courier')
    .fontSize(9)
    .fillColor('#555')
    .text(`MOB: ${challan.customer_mobile}`, LEFT, billY + 28);

  if (challan.customer_gst) {
    doc
      .font('Courier')
      .fontSize(9)
      .text(`GST: ${challan.customer_gst}`, LEFT, billY + 40);
  }

  if (challan.customer_address) {
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#777')
      .text(challan.customer_address, LEFT, billY + (challan.customer_gst ? 54 : 40), {
        width: 240,
      });
  }

  // Created by (right column)
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(STEEL)
    .text('PREPARED BY', 0, billY, { align: 'right', width: PAGE_W + LEFT });

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(INK)
    .text(challan.created_by_name, 0, billY + 12, { align: 'right', width: PAGE_W + LEFT });

  if (challan.confirmed_at) {
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#777')
      .text(
        `Confirmed: ${new Date(challan.confirmed_at).toLocaleDateString('en-IN')}`,
        0, billY + 28, { align: 'right', width: PAGE_W + LEFT }
      );
  }

  // ── Divider ───────────────────────────────────────────────────────────────
  const tableY = 220;
  doc.moveTo(LEFT, tableY).lineTo(LEFT + PAGE_W, tableY).strokeColor(STEEL).lineWidth(1).stroke();

  // ── Table header ──────────────────────────────────────────────────────────
  const COL = {
    no:    { x: LEFT,       w: 30  },
    sku:   { x: LEFT + 30,  w: 90  },
    name:  { x: LEFT + 120, w: 210 },
    qty:   { x: LEFT + 330, w: 50  },
    price: { x: LEFT + 380, w: 70  },
    total: { x: LEFT + 450, w: 65  },
  };

  const headerY = tableY + 6;
  doc.font('Helvetica-Bold').fontSize(8).fillColor(STEEL);
  doc.text('#',          COL.no.x,    headerY, { width: COL.no.w });
  doc.text('SKU',        COL.sku.x,   headerY, { width: COL.sku.w });
  doc.text('DESCRIPTION',COL.name.x,  headerY, { width: COL.name.w });
  doc.text('QTY',        COL.qty.x,   headerY, { width: COL.qty.w,   align: 'right' });
  doc.text('UNIT PRICE', COL.price.x, headerY, { width: COL.price.w, align: 'right' });
  doc.text('TOTAL',      COL.total.x, headerY, { width: COL.total.w, align: 'right' });

  doc
    .moveTo(LEFT, tableY + 20)
    .lineTo(LEFT + PAGE_W, tableY + 20)
    .strokeColor('#DDD')
    .lineWidth(0.5)
    .stroke();

  // ── Table rows ────────────────────────────────────────────────────────────
  let rowY = tableY + 28;
  let grandTotal = 0;

  items.forEach((item, idx) => {
    const unitPrice = parseFloat(item.unit_price_snapshot);
    const lineTotal = unitPrice * item.quantity;
    grandTotal += lineTotal;

    // Alternate row background
    if (idx % 2 === 0) {
      doc.rect(LEFT, rowY - 3, PAGE_W, 16).fill('#F8F8F8');
    }

    doc.font('Helvetica').fontSize(9).fillColor(INK);
    doc.text(String(idx + 1),     COL.no.x,    rowY, { width: COL.no.w });

    doc.font('Courier').fontSize(9).fillColor('#333');
    doc.text(item.sku_snapshot,    COL.sku.x,   rowY, { width: COL.sku.w });

    doc.font('Helvetica').fontSize(9).fillColor(INK);
    doc.text(item.product_name_snapshot, COL.name.x, rowY, { width: COL.name.w });

    doc.font('Courier').fontSize(9).fillColor('#333');
    doc.text(String(item.quantity),     COL.qty.x,   rowY, { width: COL.qty.w,   align: 'right' });
    doc.text(`₹${unitPrice.toFixed(2)}`, COL.price.x, rowY, { width: COL.price.w, align: 'right' });
    doc.text(`₹${lineTotal.toFixed(2)}`, COL.total.x, rowY, { width: COL.total.w, align: 'right' });

    rowY += 18;

    // New page if needed
    if (rowY > doc.page.height - 120) {
      doc.addPage();
      rowY = 60;
    }
  });

  // ── Totals block ──────────────────────────────────────────────────────────
  const totalY = rowY + 10;

  doc
    .moveTo(LEFT, totalY)
    .lineTo(LEFT + PAGE_W, totalY)
    .strokeColor(STEEL)
    .lineWidth(0.8)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(STEEL)
    .text(`TOTAL QTY: ${challan.total_quantity}`, LEFT, totalY + 8);

  doc
    .font('Courier-Bold')
    .fontSize(14)
    .fillColor(INK)
    .text(`GRAND TOTAL: ₹${grandTotal.toFixed(2)}`, 0, totalY + 6, {
      align: 'right',
      width: PAGE_W + LEFT,
    });

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = doc.page.height - 60;
  doc
    .moveTo(LEFT, footerY)
    .lineTo(LEFT + PAGE_W, footerY)
    .strokeColor('#EEE')
    .lineWidth(0.5)
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#AAA')
    .text(
      'This is a computer-generated document. No signature required. — FreightLedger Operations Portal',
      LEFT, footerY + 8, { width: PAGE_W, align: 'center' }
    );

  doc.end();
}
