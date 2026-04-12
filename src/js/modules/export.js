// Aquí manejo la exportación del Balance General a PDF
// Uso jsPDF para generar el archivo y el diálogo de guardado de Electron

// Exporto el Balance General a PDF
async function exportBalancePDF() {
    try {
        // Importo jsPDF de manera dinámica desde node_modules
        const { jsPDF } = window.jspdf || {};

        // Si jsPDF no está disponible como global, lo creo manualmente
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });

        const balanceData = generateBalanceSheet();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let y = margin;

        // === ENCABEZADO ===
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(balanceData.header.companyName, pageWidth / 2, y, { align: 'center' });
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(balanceData.header.reportTitle, pageWidth / 2, y, { align: 'center' });
        y += 6;

        doc.setFontSize(10);
        doc.text(`${t('balance.asOf')} ${balanceData.header.date}`, pageWidth / 2, y, { align: 'center' });
        y += 10;

        // Línea separadora
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // === CUERPO ===

        // Función auxiliar para renderizar una sección
        function renderSection(title, accounts, total, totalLabel) {
            // Título de la sección
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(title.toUpperCase(), margin, y);
            y += 2;

            doc.setLineWidth(0.3);
            doc.setDrawColor(232, 119, 46); // Color naranja del acento
            doc.line(margin, y, margin + 50, y);
            doc.setDrawColor(0);
            y += 6;

            // Cuentas
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            accounts.forEach(acc => {
                doc.text(acc.name, margin + 10, y);
                doc.text(formatCurrency(acc.balance), pageWidth - margin, y, { align: 'right' });
                y += 5;
            });

            // Subtotal
            y += 2;
            doc.setLineWidth(0.2);
            doc.line(pageWidth - margin - 50, y - 2, pageWidth - margin, y - 2);

            doc.setFont('helvetica', 'bold');
            doc.text(totalLabel, margin + 5, y + 2);
            doc.text(formatCurrency(total), pageWidth - margin, y + 2, { align: 'right' });
            y += 10;
        }

        // Activo
        renderSection(
            balanceData.body.assets.title,
            balanceData.body.assets.accounts,
            balanceData.totals.totalAssets,
            t('balance.totalAssets')
        );

        // Pasivo
        renderSection(
            balanceData.body.liabilities.title,
            balanceData.body.liabilities.accounts,
            balanceData.totals.totalLiabilities,
            t('balance.totalLiabilities')
        );

        // Capital
        renderSection(
            balanceData.body.equity.title,
            balanceData.body.equity.accounts,
            balanceData.totals.totalEquity,
            t('balance.totalEquity')
        );

        // === TOTAL PASIVO + CAPITAL ===
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(t('balance.totalLiabilitiesEquity'), margin + 5, y);
        doc.text(formatCurrency(balanceData.totals.totalLiabilitiesEquity), pageWidth - margin, y, { align: 'right' });
        y += 3;

        doc.setLineWidth(0.3);
        doc.line(pageWidth - margin - 50, y, pageWidth - margin, y);
        y += 1;
        doc.line(pageWidth - margin - 50, y, pageWidth - margin, y);
        y += 8;

        // === ECUACIÓN CONTABLE ===
        const equationText = balanceData.totals.isBalanced
            ? t('balance.equationValid')
            : t('balance.equationInvalid');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        if (balanceData.totals.isBalanced) {
            doc.setTextColor(34, 197, 94); // Verde
        } else {
            doc.setTextColor(239, 68, 68); // Rojo
        }
        doc.text(equationText, pageWidth / 2, y, { align: 'center' });
        doc.setTextColor(0);
        y += 15;

        // === PIE ===
        // Verifico que quepa en la página, si no, agrego una nueva
        if (y > doc.internal.pageSize.getHeight() - 50) {
            doc.addPage();
            y = margin;
        }

        const sigWidth = contentWidth / 3;
        const sigY = y + 15;

        // Firmas
        const signatures = [
            { title: t('balance.preparedBy'), role: t('balance.accountant') },
            { title: t('balance.reviewedBy'), role: t('balance.manager') },
            { title: t('balance.authorizedBy'), role: t('balance.director') }
        ];

        signatures.forEach((sig, i) => {
            const x = margin + (sigWidth * i) + (sigWidth / 2);

            // Línea de firma
            doc.setLineWidth(0.3);
            doc.line(x - 25, sigY, x + 25, sigY);

            // Título
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(sig.title, x, sigY + 5, { align: 'center' });

            // Rol
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(sig.role, x, sigY + 9, { align: 'center' });
        });

        // Nota al pie
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(balanceData.footer.note, pageWidth / 2, sigY + 18, { align: 'center' });
        doc.setTextColor(0);

        // === Guardo el PDF ===
        const result = await window.api.showSaveDialog({
            title: 'Guardar Balance General',
            defaultPath: `Balance_General_${new Date().toISOString().split('T')[0]}.pdf`,
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });

        if (!result.canceled && result.filePath) {
            const pdfBase64 = doc.output('datauristring').split(',')[1];
            await window.api.writeBinaryFile(result.filePath, pdfBase64);
            showToast(t('toast.pdfExported'), 'success');
        }
    } catch (error) {
        console.error('Error al exportar PDF:', error);
        showToast(t('general.error') + ': ' + error.message, 'error');
    }
}

// Exporto el Estado de Resultados a PDF
async function exportIncomeStatementPDF() {
    try {
        const { jsPDF } = window.jspdf || {};
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });

        const incomeData = generateIncomeStatement();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let y = margin;

        // === ENCABEZADO ===
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(incomeData.header.companyName, pageWidth / 2, y, { align: 'center' });
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(incomeData.header.reportTitle, pageWidth / 2, y, { align: 'center' });
        y += 6;

        doc.setFontSize(10);
        doc.text(`${t('incomeStatement.period') || 'Del'} ${incomeData.header.periodStart} ${t('incomeStatement.to') || 'al'} ${incomeData.header.periodEnd}`, pageWidth / 2, y, { align: 'center' });
        y += 10;

        // Línea separadora
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // === CUERPO ===
        function renderSection(title, accounts, total, totalLabel) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(title.toUpperCase(), margin, y);
            y += 2;

            doc.setLineWidth(0.3);
            doc.setDrawColor(232, 119, 46);
            doc.line(margin, y, margin + 50, y);
            doc.setDrawColor(0);
            y += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            accounts.forEach(acc => {
                doc.text(acc.name, margin + 10, y);
                doc.text(formatCurrency(acc.balance), pageWidth - margin, y, { align: 'right' });
                y += 5;
            });

            y += 2;
            doc.setLineWidth(0.2);
            doc.line(pageWidth - margin - 50, y - 2, pageWidth - margin, y - 2);

            doc.setFont('helvetica', 'bold');
            doc.text(totalLabel, margin + 5, y + 2);
            doc.text(formatCurrency(total), pageWidth - margin, y + 2, { align: 'right' });
            y += 10;
        }

        // Ingresos
        renderSection(
            incomeData.body.revenues.title,
            incomeData.body.revenues.accounts,
            incomeData.totals.totalRevenues || incomeData.body.revenues.total,
            t('incomeStatement.totalRevenues') || 'Ventas Netas'
        );

        // Costo de Ventas
        renderSection(
            incomeData.body.costOfSales.title,
            incomeData.body.costOfSales.accounts,
            incomeData.body.costOfSales.total,
            t('incomeStatement.totalCostOfSales') || 'Costo de Ventas Total'
        );

        // Utilidad Bruta
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const grossProfitLabel = incomeData.totals.grossProfit >= 0 ? (t('incomeStatement.grossProfit') || 'Utilidad Bruta') : 'Pérdida Bruta';
        doc.text(grossProfitLabel, margin + 5, y);
        doc.text(formatCurrency(incomeData.totals.grossProfit), pageWidth - margin, y, { align: 'right' });
        y += 10;

        // Gastos de Operación
        renderSection(
            incomeData.body.operatingExpenses.title,
            incomeData.body.operatingExpenses.accounts,
            incomeData.body.operatingExpenses.total,
            t('incomeStatement.totalOperatingExpenses') || 'Gastos de Operación Total'
        );

        // Utilidad de Operación
        doc.setFont('helvetica', 'bold');
        const opProfitLabel = incomeData.totals.operatingProfit >= 0 ? (t('incomeStatement.operatingProfit') || 'Utilidad de Operación') : 'Pérdida de Operación';
        doc.text(opProfitLabel, margin + 5, y);
        doc.text(formatCurrency(incomeData.totals.operatingProfit), pageWidth - margin, y, { align: 'right' });
        y += 8;

        // PTU y ISR
        doc.setFont('helvetica', 'normal');
        if (incomeData.body.ptu !== undefined) {
            doc.text('PTU (10%)', margin + 5, y);
            doc.text(formatCurrency(incomeData.body.ptu), pageWidth - margin, y, { align: 'right' });
            y += 8;
        }

        doc.text(t('incomeStatement.incomeTax') || 'ISR (30%)', margin + 5, y);
        doc.text(formatCurrency(incomeData.body.incomeTax), pageWidth - margin, y, { align: 'right' });
        y += 8;

        // === UTILIDAD NETA ===
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const netProfitLabel = incomeData.totals.netProfit >= 0 ? (t('incomeStatement.netProfit') || 'Utilidad Neta del Ejercicio') : 'Pérdida Neta del Ejercicio';
        doc.text(netProfitLabel, margin + 5, y);
        doc.text(formatCurrency(incomeData.totals.netProfit), pageWidth - margin, y, { align: 'right' });
        y += 3;

        doc.setLineWidth(0.3);
        doc.line(pageWidth - margin - 50, y, pageWidth - margin, y);
        y += 1;
        doc.line(pageWidth - margin - 50, y, pageWidth - margin, y);
        y += 15;

        // === PIE ===
        if (y > doc.internal.pageSize.getHeight() - 50) {
            doc.addPage();
            y = margin;
        }

        const sigWidth = contentWidth / 3;
        const sigY = y + 15;

        const signatures = [
            { title: t('balance.preparedBy'), role: t('balance.accountant') },
            { title: t('balance.reviewedBy'), role: t('balance.manager') },
            { title: t('balance.authorizedBy'), role: t('balance.director') }
        ];

        signatures.forEach((sig, i) => {
            const x = margin + (sigWidth * i) + (sigWidth / 2);
            doc.setLineWidth(0.3);
            doc.line(x - 25, sigY, x + 25, sigY);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(sig.title, x, sigY + 5, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(sig.role, x, sigY + 9, { align: 'center' });
        });

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(incomeData.footer.note, pageWidth / 2, sigY + 18, { align: 'center' });
        doc.setTextColor(0);

        // Guardo el PDF
        const result = await window.api.showSaveDialog({
            title: 'Guardar Estado de Resultados',
            defaultPath: `Estado_Resultados_${new Date().toISOString().split('T')[0]}.pdf`,
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });

        if (!result.canceled && result.filePath) {
            const pdfBase64 = doc.output('datauristring').split(',')[1];
            await window.api.writeBinaryFile(result.filePath, pdfBase64);
            showToast(t('toast.pdfExported'), 'success');
        }
    } catch (error) {
        console.error('Error al exportar PDF:', error);
        showToast(t('general.error') + ': ' + error.message, 'error');
    }
}
