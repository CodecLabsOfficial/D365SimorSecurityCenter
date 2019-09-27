$(document).ready(function () {
    loadDashboard();
});

$(".menu-button").click(function () {
    var path = $(this).data("path");
    if (path != "#") {
        window.open(path, '_blank');
    }
});

function loadDashboard() {
    $("#right-panel").loading({ message: "Loading" });

    var url = "Home_Dashboard.htm";
    $("#right-panel").load(url);

    $("#right-panel").loading("stop");
}