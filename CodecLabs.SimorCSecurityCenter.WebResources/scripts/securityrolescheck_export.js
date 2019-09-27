var CRMHelper = (function (helper) {
    var exportCode = {
        WriteReport: () => {
            // TODO: Fix this gambiarra
            setTimeout(function () {
                var title = 'SimorCCRMUtilities-RolesCheck-' + $('.user-row.active').html() + '-' + Date.now();

                var printWindow = window.open('', '', 'height=400,width=800');
                printWindow.document.write('<html><head><title>' + title + '</title>');
                printWindow.document.write('<link rel="stylesheet" type="text/css" href="../styles/metro_bootstrap.min.css">');
                printWindow.document.write('<link rel="stylesheet" type="text/css" href="../styles/font_awesome.min.css">');
                printWindow.document.write('<link rel="stylesheet" type="text/css" href="../styles/jquery.loading.min.css">');
                printWindow.document.write('<link rel="stylesheet" type="text/css" href="../styles/animate.min.css">');
                printWindow.document.write('<link rel="stylesheet" type="text/css" href="../styles/custom.css">');
                printWindow.document.write('<link rel="stylesheet" type="text/css" href="../styles/securityrolescheck.css">');
                printWindow.document.write('<link rel="stylesheet" type="text/css" href="../styles/securityrolescheck_print.css">');
                printWindow.document.write('</head><body>');

                // User Name
                printWindow.document.write('<div id="user-name">');
                printWindow.document.write('<h2>' + $('.user-row.active').html() + '</h2> ');
                printWindow.document.write('<h10>' + Xrm.Page.context.getClientUrl() + ' - ' + new Date() + '</h10>');
                printWindow.document.write('</div>');
                // User Roles
                printWindow.document.write('<div id="user-roles">');
                printWindow.document.write($("#right-col-top").html());
                printWindow.document.write('</div>');
                // User Teams
                printWindow.document.write('<div id="user-teams">');
                printWindow.document.write($("#right-col-bottom").html());
                printWindow.document.write('</div>');
                // Core
                printWindow.document.write('<div class="user-privileges">');
                printWindow.document.write($("#tabCore").html());
                printWindow.document.write('</div>');
                // Marketing
                printWindow.document.write('<div class="user-privileges">');
                printWindow.document.write($("#tabMarketing").html());
                printWindow.document.write('</div>');
                // Sales
                printWindow.document.write('<div class="user-privileges">');
                printWindow.document.write($("#tabSales").html());
                printWindow.document.write('</div>');
                // Service
                printWindow.document.write('<div class="user-privileges">');
                printWindow.document.write($("#tabService").html());
                printWindow.document.write('</div>');
                // Business Management
                printWindow.document.write('<div class="user-privileges">');
                printWindow.document.write($("#tabBusinessManagement").html());
                printWindow.document.write('</div>');
                // Service Management
                printWindow.document.write('<div class="user-privileges">');
                printWindow.document.write($("#tabServiceManagement").html());
                printWindow.document.write('</div>');
                // Customization
                printWindow.document.write('<div class="user-privileges">');
                printWindow.document.write($("#tabCustomization").html());
                printWindow.document.write('</div>');
                // Custom Entities
                printWindow.document.write('<div class="user-privileges">');
                printWindow.document.write($("#tabCustomEntities").html());
                printWindow.document.write('</div>');
                // Other
                printWindow.document.write('<div class="user-privileges">');
                printWindow.document.write($("#tabOther").html());
                printWindow.document.write('</div>');

                printWindow.document.write('</body></html>');
                printWindow.document.close();
                setTimeout(function () { printWindow.print() }, 750);
            }, 100);
        }
    }

    helper.SimorCExport = exportCode;
    return helper;

}(CRMHelper || {}));