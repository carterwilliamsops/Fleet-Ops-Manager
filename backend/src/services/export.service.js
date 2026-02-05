const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ExportService {
  /**
   * Generate CSV for maintenance logs
   */
  static async generateMaintenanceCSV(data, outputPath) {
    const csvWriter = createCsvWriter({
      path: outputPath,
      header: [
        { id: 'vehicle_id', title: 'Vehicle ID' },
        { id: 'vin', title: 'VIN' },
        { id: 'make', title: 'Make' },
        { id: 'model', title: 'Model' },
        { id: 'date', title: 'Date' },
        { id: 'category', title: 'Issue Category' },
        { id: 'description', title: 'Description' },
        { id: 'fix', title: 'Fix Applied' },
        { id: 'parts_cost', title: 'Parts Cost' },
        { id: 'labor_hours', title: 'Labor Hours' },
        { id: 'technician', title: 'Technician' },
        { id: 'total_cost', title: 'Total Cost' }
      ]
    });

    await csvWriter.writeRecords(data);
    return outputPath;
  }

  /**
   * Generate CSV for repair analytics
   */
  static async generateRepairAnalyticsCSV(data, outputPath) {
    const csvWriter = createCsvWriter({
      path: outputPath,
      header: [
        { id: 'category', title: 'Repair Category' },
        { id: 'occurrence_count', title: 'Times Performed' },
        { id: 'total_cost', title: 'Total Cost' },
        { id: 'avg_cost_per_repair', title: 'Avg Cost Per Repair' },
        { id: 'unique_tickets', title: 'Unique Tickets' }
      ]
    });

    await csvWriter.writeRecords(data);
    return outputPath;
  }

  /**
   * Generate PDF report
   */
  static async generatePDFReport(reportData, outputPath) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
      const stream = fs.createWriteStream(outputPath);
      
      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold')
         .text('Fleet Management Report', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(10).font('Helvetica')
         .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      
      doc.moveDown(2);

      // Summary Section
      if (reportData.summary) {
        doc.fontSize(14).font('Helvetica-Bold')
           .text('Fleet Summary', { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(10).font('Helvetica');
        Object.entries(reportData.summary).forEach(([key, value]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          doc.text(`${label}: ${value}`);
        });
        
        doc.moveDown(1.5);
      }

      // Common Repairs Section
      if (reportData.commonRepairs && reportData.commonRepairs.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold')
           .text('Most Common Repairs', { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(10).font('Helvetica');
        reportData.commonRepairs.forEach((repair, index) => {
          doc.text(
            `${index + 1}. ${repair.category} - ${repair.occurrence_count} occurrences ($${parseFloat(repair.total_cost || 0).toFixed(2)})`
          );
        });
        
        doc.moveDown(1.5);
      }

      // Vehicle Performance Section
      if (reportData.vehiclePerformance && reportData.vehiclePerformance.length > 0) {
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold')
           .text('Vehicle Performance', { underline: true });
        doc.moveDown(0.5);
        
        // Table headers
        doc.fontSize(9).font('Helvetica-Bold');
        const tableTop = doc.y;
        doc.text('VIN', 50, tableTop, { width: 100 });
        doc.text('Make/Model', 160, tableTop, { width: 120 });
        doc.text('Hours', 290, tableTop, { width: 60, align: 'right' });
        doc.text('Orders', 360, tableTop, { width: 60, align: 'right' });
        doc.text('Cost', 430, tableTop, { width: 80, align: 'right' });
        
        doc.moveDown(0.8);
        doc.moveTo(50, doc.y).lineTo(520, doc.y).stroke();
        doc.moveDown(0.3);
        
        // Table data
        doc.fontSize(8).font('Helvetica');
        reportData.vehiclePerformance.forEach(vehicle => {
          const y = doc.y;
          doc.text(vehicle.vin, 50, y, { width: 100 });
          doc.text(`${vehicle.make} ${vehicle.model}`, 160, y, { width: 120 });
          doc.text(parseFloat(vehicle.total_hours || 0).toFixed(1), 290, y, { width: 60, align: 'right' });
          doc.text(vehicle.total_work_orders, 360, y, { width: 60, align: 'right' });
          doc.text(`$${parseFloat(vehicle.total_parts_cost || 0).toFixed(2)}`, 430, y, { width: 80, align: 'right' });
          doc.moveDown(0.7);
        });
      }

      // Cost Analysis Section
      if (reportData.costAnalysis && reportData.costAnalysis.length > 0) {
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold')
           .text('Cost Analysis by Category', { underline: true });
        doc.moveDown(1);
        
        doc.fontSize(10).font('Helvetica');
        reportData.costAnalysis.forEach(category => {
          doc.text(`${category.category}:`, { continued: true, bold: true });
          doc.text(` ${category.repair_count} repairs | Parts: $${parseFloat(category.total_parts_cost || 0).toFixed(2)} | Labor: $${parseFloat(category.estimated_labor_cost || 0).toFixed(2)}`);
          doc.moveDown(0.5);
        });
      }

      // Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).font('Helvetica')
           .text(
             `Page ${i + 1} of ${pages.count}`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );
      }

      doc.end();
      
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  /**
   * Format maintenance data for export
   */
  static formatMaintenanceData(rawData) {
    return rawData.map(item => ({
      vehicle_id: item.vehicle_id,
      vin: item.vin,
      make: item.make,
      model: item.model,
      date: new Date(item.reported_at).toLocaleDateString(),
      category: item.category,
      description: item.description,
      fix: item.notes || 'N/A',
      parts_cost: parseFloat(item.total_parts_cost || 0).toFixed(2),
      labor_hours: parseFloat(item.total_labor_hours || 0).toFixed(2),
      technician: item.technician_name || 'Unassigned',
      total_cost: (
        parseFloat(item.total_parts_cost || 0) + 
        (parseFloat(item.total_labor_hours || 0) * 75)
      ).toFixed(2)
    }));
  }
}

module.exports = ExportService;
