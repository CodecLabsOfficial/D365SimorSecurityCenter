$("#btnLicenses").click(function () {
    $(".tile-license").toggle();
    $(this).toggleClass("active");
});

$("#btnRoles").click(function () {
    window.open('/tools/AdminSecurity/adminsecurity_area.aspx?pid=01&web=true', '_blank');
});

$("#btnUsers").click(function () {
    window.open('/tools/AdminSecurity/adminsecurity_area.aspx?pid=06&web=true', '_blank');
});

$("#btnTeams").click(function () {
    window.open('/tools/AdminSecurity/adminsecurity_area.aspx?pid=07&web=true', '_blank');
});

$(document).ready(function () {
    getDefaultBusinessUnit((bu) => {
        populateNumRoles();
        populateNumTeams(bu[0]);
        populateNumUsers();
    });
});

function getDefaultBusinessUnit(callback) {
    var entityName = "businessunit";
    var select = "businessunitid,name";
    var filter = "_parentbusinessunitid_value eq null";

    CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, filter, null, null, null, true, callback, null)
}

function populateNumRoles() {
    var entityName = "role";
    var select = "roleid,name";
    var filter = "_parentroleid_value eq null";
    var orderby = "name asc";

    CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, filter, null, orderby, null, true, populateNumRolesCallback, populateNumRolesFailCallback)
}

function populateNumRolesCallback(result) {
    // -1 because the role "Support User" doesn't appear in D365 but it's also retrieved when doing the query
    let numRoles = result.length - 1;
    $("#txtNumRoles").html(numRoles);
}

function populateNumRolesFailCallback(req) {
    defaultError('Error populating number of Roles', 'Num roles load', req);
}

function populateNumTeams(defaultBU) {
    var entityName = "team";
    var select = "teamid";
    var filter = "isdefault eq false or (name eq '" + defaultBU.name + "' and isdefault eq true)";

    CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, filter, null, null, null, true, populateNumTeamsCallback, populateNumTeamsFailCallback)
}

function populateNumTeamsCallback(result) {
    $("#txtNumTeams").html(result.length);
}

function populateNumTeamsFailCallback(req) {
    defaultError('Error populating number of Teams', 'Num teams load', req);
}

function populateNumUsers() {
    var entityName = "systemuser";
    var select = "systemuserid,isdisabled,caltype";

    CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, null, null, null, null, true, populateNumUsersCallback, populateNumUsersFailCallback)
}

function populateNumUsersCallback(result) {
    var activeUsers = result.filter(user => user.isdisabled == false);
    var userLicenseTypes = getGroupByCount(result, "caltype");
    var retWithCaltype = $.map(result, user => CRMHelper.Data.WebAPI.GetFormattedValue(user, "caltype"));

    $("#txtNumUsers").html(result.length);
    $("#txtNumActiveUsers").html(activeUsers.length);
    $("#txtLicenses").html(userLicenseTypes);
    setLicenseRows(retWithCaltype);
}

function setLicenseRows(retWithCaltype) {
    var uniqueCaltype = $.uniqueSort(retWithCaltype.slice(0).sort().reverse());
    
    uniqueCaltype.forEach(license => {
        var count = retWithCaltype.filter(ret => ret == license).length;

        var licenseTile = "";
        licenseTile += "<div class='tile tile-big tile-clouds tile-license' style='display:none'>";
        licenseTile += "  <h1 class='text-italic'>";
        licenseTile += license;
        licenseTile += "  </h1>";
        licenseTile += "  <h2>";
        licenseTile += count;
        licenseTile += "  </h2>";
        licenseTile += "</div>";

        $("#btnLicenses").after(licenseTile);
    });
}

function populateNumUsersFailCallback(req) {
    defaultError('Error populating number of Users', 'Num users load', req);
}

function getGroupByCount(array, attr) {
    var retArr = [];

    array.forEach(function (item) {
        if (retArr.indexOf(item[attr]) < 0) {
            retArr.push(item[attr]);
        }
    });

    return retArr.length;
}