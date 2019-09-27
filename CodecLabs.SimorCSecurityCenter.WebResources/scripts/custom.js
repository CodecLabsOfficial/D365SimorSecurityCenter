$('.nav-tabs li a').click(function (e) {
    e.preventDefault();
    var tabId = $(this).attr('href');

    $('.nav-tabs li').removeClass('active');
    $(this).parent('li').addClass('active');

    $('.tab-container').removeClass('active');
    $(tabId).addClass('active');
});

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

try {
    // Remove the removal (?) of the context menu from ClientGlobalContext
    document.removeEventListener("contextmenu", document._events["contextmenu"][0].browserHandler, false);
} catch (e) { }

function showNotifyMessage(type, title, message, delayTime) {
    delayTime = delayTime || 10000;
    let notifySettings = getNotifySettings();

    $.notify({
        // options
        title: title,
        message: message,
    }, notifySettings);
}

function getNotifySettings() {
    return {
        type: type, //info, danger or success
            allow_dismiss: true,
                placement: {
            from: "top",
                align: "right"
        },
        offset: 20,
            spacing: 10,
                z_index: 1031,
                    delay: delayTime,
                        timer: 1000,
                            animate: {
            enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
        }
    }
}

function defaultError(notifyTitle, logTitle, req) {
    var plainError = CRMHelper.Error.GetPlainErrorMessage(req);
    showNotifyMessage('danger', notifyTitle, 'For more information check the console: ' + plainError);
    CRMHelper.Error.WriteErrorOnConsole(logTitle, null, req);
}