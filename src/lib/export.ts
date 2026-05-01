import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Task } from '../types';
import { format, parseISO } from 'date-fns';

export const exportToPDF = (tasks: Task[], periodLabel: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(`Assist IQ - Mission Report - ${periodLabel}`, 14, 22);
  
  const totalRevenue = tasks.reduce((sum, t) => sum + t.price, 0);
  doc.setFontSize(12);
  doc.text(`Total Tasks: ${tasks.length} | Total Revenue: ${totalRevenue.toLocaleString()} DH`, 14, 30);

  const tableData = tasks.map(task => [
    task.date ? format(parseISO(task.date), 'yyyy-MM-dd') : 'N/A',
    task.insuranceCompany || 'N/A',
    task.status || 'N/A',
    task.city || 'N/A',
    task.agent || 'N/A',
    `${(task.price || 0).toLocaleString()} DH`
  ]);

  const headers = ['Date', 'Company', 'Status', 'City', 'Agent', 'Price'];

  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138] }, 
  });

  // Precise Categories according to user request
  const urban = tasks.filter(t => t.price === 30);
  const rayoun = tasks.filter(t => t.price === 60);
  const urbanPhoto = tasks.filter(t => t.price === 10);
  const rayounPhoto = tasks.filter(t => t.price === 15);
  
  const catTotalCount = urban.length + rayoun.length + urbanPhoto.length + rayounPhoto.length;
  const catTotalRevenue = (urban.length * 30) + (rayoun.length * 60) + (urbanPhoto.length * 10) + (rayounPhoto.length * 15);

  const summaryData = [
    ['URBAN', '30 DH', urban.length, `${(urban.length * 30).toLocaleString()} DH`],
    ['RAYOUN', '60 DH', rayoun.length, `${(rayoun.length * 60).toLocaleString()} DH`],
    ['URBAN PRISE PHOTO', '10 DH', urbanPhoto.length, `${(urbanPhoto.length * 10).toLocaleString()} DH`],
    ['RAYOUN PRIS PHOTO', '15 DH', rayounPhoto.length, `${(rayounPhoto.length * 15).toLocaleString()} DH`],
    ['CATEGORY TOTAL', '', catTotalCount, `${catTotalRevenue.toLocaleString()} DH`],
    ['GRAND TOTAL', '', tasks.length, `${totalRevenue.toLocaleString()} DH`]
  ];

  doc.setFontSize(14);
  doc.text('Performance Categorization Summary', 14, (doc as any).lastAutoTable.finalY + 15);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Category', 'Rate', 'Count', 'Subtotal']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110] },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' }
    }
  });

  doc.save(`Mission_Report_${periodLabel.replace(' ', '_')}.pdf`);
};

export const exportToExcel = (tasks: Task[], periodLabel: string) => {
  const wsData = tasks.map(task => ({
    Date: task.date ? format(parseISO(task.date), 'yyyy-MM-dd') : 'N/A',
    Company: task.insuranceCompany || 'N/A',
    Status: task.status || 'N/A',
    City: task.city || 'N/A',
    Agent: task.agent || 'N/A',
    'Price (DH)': task.price || 0
  }));

  const totalRevenue = tasks.reduce((sum, t) => sum + t.price, 0);
  
  const ws = XLSX.utils.json_to_sheet(wsData);

  // Add Summary Table to Excel (Categorization)
  const urbanCount = tasks.filter(t => t.price === 30).length;
  const rayounCount = tasks.filter(t => t.price === 60).length;
  const urbanPhotoCount = tasks.filter(t => t.price === 10).length;
  const rayounPhotoCount = tasks.filter(t => t.price === 15).length;
  
  const catTotalRevenue = (urbanCount * 30) + (rayounCount * 60) + (urbanPhotoCount * 10) + (rayounPhotoCount * 15);

  const summary = [
    [],
    ['PERFORMANCE CATEGORIZATION'],
    ['Category', 'Rate', 'Count', 'Subtotal'],
    ['URBAN', 30, urbanCount, urbanCount * 30],
    ['RAYOUN', 60, rayounCount, rayounCount * 60],
    ['URBAN PRISE PHOTO', 10, urbanPhotoCount, urbanPhotoCount * 10],
    ['RAYOUN PRIS PHOTO', 15, rayounPhotoCount, rayounPhotoCount * 15],
    ['------------------', '-------', '-------', '----------'],
    ['CATEGORY SUM', '', urbanCount + rayounCount + urbanPhotoCount + rayounPhotoCount, catTotalRevenue],
    ['GRAND TOTAL', '', tasks.length, totalRevenue]
  ];

  XLSX.utils.sheet_add_aoa(ws, summary, { origin: -1 });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Missions');
  
  XLSX.writeFile(wb, `Mission_Report_${periodLabel.replace(' ', '_')}.xlsx`);
};
