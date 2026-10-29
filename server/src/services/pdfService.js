import PDFDocument from 'pdfkit';
import { toMajorUnits } from '../utils/moneyMath.js';

export function createItineraryPdfStream({ trip, days = [], itemsByDay = {}, reservations = [] }) {
  const doc = new PDFDocument({ margin: 45, size: 'A4' });

  // Header / Branding
  doc.rect(0, 0, doc.page.width, 90).fill('#0f172a'); // Navy Slate
  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('RouteCraft', 45, 25);
  doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text('Craft your perfect itinerary.', 45, 52);
  doc.fontSize(10).fillColor('#38bdf8').text(`Exported: ${new Date().toLocaleDateString()}`, 400, 52, { align: 'right' });

  doc.moveDown(4);

  // Trip Summary Card
  doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold').text(trip.title);
  doc.fontSize(11).font('Helvetica').fillColor('#475569');
  
  const startStr = new Date(trip.startDate).toLocaleDateString();
  const endStr = new Date(trip.endDate).toLocaleDateString();
  doc.text(`Dates: ${startStr} — ${endStr}`);
  if (trip.primaryDestinationName) {
    doc.text(`Destination: ${trip.primaryDestinationName}`);
  }
  if (trip.description) {
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#334155').text(trip.description);
  }

  // Budget summary
  const totalBudget = toMajorUnits(trip.totalBudgetMinor || 0);
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#0284c7').text(`Budget: ${trip.currency} ${totalBudget.toFixed(2)}`);

  doc.moveDown(1);
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // Day-by-Day Itinerary
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('Day-by-Day Itinerary');
  doc.moveDown(0.5);

  if (days.length === 0) {
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#64748b').text('No itinerary days scheduled yet.');
  } else {
    days.forEach((day) => {
      const dayDateStr = new Date(day.date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const dayTitle = day.title ? ` - ${day.title}` : '';

      doc.moveDown(0.8);
      // Day Header Badge
      const dayY = doc.y;
      doc.rect(45, dayY, 505, 24).fill('#f1f5f9');
      doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold')
        .text(`Day ${day.dayNumber}: ${dayDateStr}${dayTitle}`, 55, dayY + 6);

      doc.moveDown(1.2);

      const items = itemsByDay[day._id.toString()] || [];
      if (items.length === 0) {
        doc.fontSize(9).font('Helvetica-Oblique').fillColor('#94a3b8').text('   No activities planned for this day.', 55);
      } else {
        items.forEach((item, idx) => {
          const timeStr = item.startTime ? `${item.startTime}${item.endTime ? ' - ' + item.endTime : ''}` : 'Anytime';
          const costStr = item.estimatedCostMinor ? ` [${item.currency} ${toMajorUnits(item.estimatedCostMinor).toFixed(2)}]` : '';

          doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a')
            .text(`${idx + 1}. ${item.title}${costStr}`, 55);

          doc.fontSize(9).font('Helvetica').fillColor('#64748b')
            .text(`   Time: ${timeStr} | Category: ${item.category} ${item.locationName ? '| Location: ' + item.locationName : ''}`, 55);

          if (item.notes) {
            doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#475569')
              .text(`   Note: ${item.notes}`, 55);
          }
          doc.moveDown(0.4);
        });
      }
    });
  }

  // Reservations Section
  if (reservations.length > 0) {
    doc.moveDown(1.5);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('Reservations & Bookings');
    doc.moveDown(0.5);

    reservations.forEach((res) => {
      const resDate = new Date(res.startDateTime).toLocaleString();
      const resCost = res.costMinor ? ` (${res.currency} ${toMajorUnits(res.costMinor).toFixed(2)})` : '';
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b')
        .text(`• [${res.type}] ${res.title} — ${res.providerName}${resCost}`);
      doc.fontSize(9).font('Helvetica').fillColor('#64748b')
        .text(`  Date: ${resDate} | Ref: ${res.bookingReference || 'N/A'} | Status: ${res.status}`);
      if (res.location) {
        doc.fontSize(8.5).fillColor('#475569').text(`  Location: ${res.location}`);
      }
      doc.moveDown(0.4);
    });
  }

  // Footer note
  doc.moveDown(2);
  doc.fontSize(8).font('Helvetica-Oblique').fillColor('#94a3b8')
    .text('Generated with RouteCraft — Your perfect travel companion.', { align: 'center' });

  doc.end();
  return doc;
}

export function createExpensesPdfStream({
  trip,
  expenses = [],
  netBalances = new Map(),
  settlementSuggestions = [],
  members = []
}) {
  const doc = new PDFDocument({ margin: 45, size: 'A4' });

  // Header / Branding
  doc.rect(0, 0, doc.page.width, 90).fill('#047857'); // Emerald Slate
  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('RouteCraft', 45, 25);
  doc.fontSize(10).font('Helvetica').fillColor('#a7f3d0').text('Trip Budget & Expense Report', 45, 52);
  doc.fontSize(10).fillColor('#ffffff').text(`Exported: ${new Date().toLocaleDateString()}`, 400, 52, { align: 'right' });

  doc.moveDown(4);

  // Trip Summary
  doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text(trip.title);
  doc.fontSize(10).font('Helvetica').fillColor('#475569').text(`Currency: ${trip.currency}`);

  let totalExpensesMinor = 0;
  const categoryTotalsMinor = {};

  expenses.forEach((e) => {
    totalExpensesMinor += e.amountMinor;
    categoryTotalsMinor[e.category] = (categoryTotalsMinor[e.category] || 0) + e.amountMinor;
  });

  const totalMajor = toMajorUnits(totalExpensesMinor);
  const totalBudgetMajor = toMajorUnits(trip.totalBudgetMinor || 0);

  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#047857')
    .text(`Total Recorded Spending: ${trip.currency} ${totalMajor.toFixed(2)} (Budget: ${trip.currency} ${totalBudgetMajor.toFixed(2)})`);

  doc.moveDown(1);
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // Category Breakdown
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('Category Breakdown');
  doc.moveDown(0.4);

  Object.entries(categoryTotalsMinor).forEach(([cat, minor]) => {
    const catMajor = toMajorUnits(minor);
    const pct = totalExpensesMinor > 0 ? ((minor / totalExpensesMinor) * 100).toFixed(1) : '0';
    doc.fontSize(9.5).font('Helvetica').fillColor('#334155')
      .text(`• ${cat.toUpperCase()}: ${trip.currency} ${catMajor.toFixed(2)} (${pct}%)`);
  });

  // Expense List
  doc.moveDown(1.5);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('Expense List');
  doc.moveDown(0.4);

  if (expenses.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748b').text('No expenses recorded.');
  } else {
    expenses.forEach((exp, idx) => {
      const expDate = new Date(exp.expenseDate).toLocaleDateString();
      const payerName = exp.payer?.name || 'Unknown';
      const amt = toMajorUnits(exp.amountMinor).toFixed(2);

      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0f172a')
        .text(`${idx + 1}. ${exp.title} — ${trip.currency} ${amt}`);
      doc.fontSize(8.5).font('Helvetica').fillColor('#64748b')
        .text(`   Paid by: ${payerName} | Date: ${expDate} | Category: ${exp.category} | Split: ${exp.splitMethod}`);
      doc.moveDown(0.3);
    });
  }

  // Net Balances & Settlements
  doc.moveDown(1.5);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('Member Net Balances');
  doc.moveDown(0.4);

  const memberMap = new Map();
  members.forEach((m) => {
    const user = m.user || m;
    if (user && user._id) {
      memberMap.set(user._id.toString(), user.name || user.email);
    }
  });

  for (const [userId, balanceMinor] of netBalances.entries()) {
    const name = memberMap.get(userId) || `User (${userId.slice(-4)})`;
    const balMajor = toMajorUnits(Math.abs(balanceMinor)).toFixed(2);

    if (balanceMinor > 0) {
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#059669')
        .text(`• ${name}: +${trip.currency} ${balMajor} (Should receive)`);
    } else if (balanceMinor < 0) {
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#dc2626')
        .text(`• ${name}: -${trip.currency} ${balMajor} (Owes)`);
    } else {
      doc.fontSize(9.5).font('Helvetica').fillColor('#64748b')
        .text(`• ${name}: Settled up ($0.00)`);
    }
  }

  // Settlement Suggestions
  doc.moveDown(1.2);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('Suggested Settlements (Minimizing Transactions)');
  doc.moveDown(0.4);

  if (settlementSuggestions.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748b').text('All balances are fully settled!');
  } else {
    settlementSuggestions.forEach((s) => {
      const payerName = memberMap.get(s.payer) || `User (${s.payer.slice(-4)})`;
      const receiverName = memberMap.get(s.receiver) || `User (${s.receiver.slice(-4)})`;
      doc.fontSize(9.5).font('Helvetica').fillColor('#1e293b')
        .text(`• ${payerName} pays ${receiverName}: ${trip.currency} ${s.amount.toFixed(2)}`);
    });
  }

  doc.moveDown(2);
  doc.fontSize(8).font('Helvetica-Oblique').fillColor('#94a3b8')
    .text('Generated with RouteCraft — Your perfect travel companion.', { align: 'center' });

  doc.end();
  return doc;
}
