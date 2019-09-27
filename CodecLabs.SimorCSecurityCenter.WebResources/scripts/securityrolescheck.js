var _allRoles = {};
var _allTeams = {};
var _allDisplayNames = {};
var _allPrivilegesMapping = {};
var _allPrivileges = {};
var _allUsers = {};
var _eventsLoaded = false;
var _userTeamsLoaded = false;
var _userRolesLoaded = false;
var _currentBusinessUnit = null;

$(document).ready(function () {
    initVars();

    loadAllDisplayNames();
    CRMHelper.SimorCUsers.loadUsers();
    //addMockUsers(40);

    CRMHelper.SimorCPrivileges.loadPrivilegesMapping();
    CRMHelper.SimorCPrivileges.loadPrivileges();
    CRMHelper.SimorCRoles.loadAllRoles();
    CRMHelper.SimorCTeams.loadAllTeams();
    loadEvents();
});

function initVars() {
    initVar(_allRoles);
    initVar(_allTeams);
    initVar(_allDisplayNames);
    initVar(_allPrivilegesMapping);
    initVar(_allPrivileges);
}

function initVar(varRef) {
    varRef.Values = [];
    varRef.Loaded = false;
}

function loadEvents() {
    $("#list-users-col").on("click", ".list-group-item", listGroupItem_OnClick);
    $("#txtSearch").keyup(txtSearch_KeyUp);
    $("#btnAddRole").click(btnAddRole_OnClick);
    $("#btnAddTeam").click(btnAddTeam_OnClick);
    $("#btnModalConfirmRole").click(btnModalConfirmRole_OnClick);
    $("#btnModalConfirmTeam").click(btnModalConfirmTeam_OnClick);
}

function listGroupItem_OnClick(e) {
    e.preventDefault();
    $('.list-group-item.active').removeClass('active');
    $(this).toggleClass('active');

    var userId = $(this).data('guid');
    _currentBusinessUnit = $(this).data('businessunitid');
    resetPage();

    $('#roles-page').loading('toggle');
    CRMHelper.SimorCRoles.getUserRolesIds(userId, loadRolesCallback, loadRolesFailCallback);
    CRMHelper.SimorCTeams.getUserTeamsIds(userId, loadTeamsCallback, loadTeamsFailCallback);

    e.stopImmediatePropagation();
}

function txtSearch_KeyUp() {
    var currentValue = $(this).val();

    if (!currentValue) {
        $('#list-users-col a').show();
    } else {
        setTimeout(function () {
            if (currentValue == $('#txtSearch').val()) {
                $('#list-users-col a').hide();
                $('#list-users-col a[data-name*=' + currentValue.toLowerCase() + ']').show();
            }
        }, 750);
    }
}

function btnAddRole_OnClick() {
    if (isUserSelected()) {
        setChangesModalInfo(true);
    }
}

function btnAddTeam_OnClick() {
    if (isUserSelected()) {
        setChangesModalInfo(false);
    }
}

function btnModalConfirmRole_OnClick() {
    var addRoles = $.map($(".add-role-checkbox:checked"), function (item) { return $(item).data("guid"); });
    var userId = $('#list-users-col').find('.active').data('guid');

    for (var i in addRoles) {
        CRMHelper.Data.WebAPI.Associate("role", addRoles[i], "systemuser", userId, "systemuserroles_association", false);
    }

    $('#list-users-col').find('.active').click();
    showNotifyMessage('success', 'Success', 'Role(s) added!', 1500);
    $("#modalChanges").modal("hide");
}

function btnModalConfirmTeam_OnClick() {
    var addTeams = $.map($(".add-team-checkbox:checked"), function (item) { return $(item).data("guid"); });
    var userId = $('#list-users-col').find('.active').data('guid');

    for (var i in addTeams) {
        CRMHelper.Data.WebAPI.Associate("team", addTeams[i], "systemuser", userId, "teammembership_association", false);
    }

    $('#list-users-col').find('.active').click();
    showNotifyMessage('success', 'Success', 'Team(s) added!', 1500);
    $("#modalChanges").modal("hide");
}

function loadAllDisplayNames() {
    var entityName = 'EntityDefinitions';
    var select = 'LogicalName,DisplayName';

    CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, null, null, null, null, true, loadAllDisplayNamesCallback, loadAllDisplayNamesFailCallback);
}

function loadAllDisplayNamesCallback(result) {
    _allDisplayNames.Values = result;
    _allDisplayNames.Loaded = true;

    CRMHelper.SimorCPrivileges.loadPrivilegesHTML();
}

function loadAllDisplayNamesFailCallback(req) {
    defaultError('Error loading Display Names', 'DisplayNames load', req);
}

function showWaitingMessage() {
    $('#roles-page').loading('stop');
    $('#list-roles-col').loading({ message: 'Waiting' });
    $('#list-teams-col').loading({ message: 'Waiting' });
    $('#list-permissions-col').loading({ message: 'Waiting' });
}

function loadTooltipster() {
    $('.tooltipster').click(function () {
        var privId = $(this).prop('id');
        loadTooltipRoles(privId);

        $(this).tooltipster('content', getTooltipContent());
    });

    $('.tooltipster').tooltipster({
        theme: 'tooltipster-light',
        trigger: 'click',
        contentCloning: true,
        contentAsHTML: true,
        content: getTooltipContent()
    });
}

function loadStickyTable() {
    loadStickyTableElement("#table_core", "#tabCore");
    loadStickyTableElement("#table_marketing", "#tabMarketing");
    loadStickyTableElement("#table_sales", "#tabSales");
    loadStickyTableElement("#table_service", "#tabService");
    loadStickyTableElement("#table_businessmanagement", "#tabBusinessManagement");
    loadStickyTableElement("#table_servicemanagement", "#tabServiceManagement");
    loadStickyTableElement("#table_customization", "#tabCustomization");
    loadStickyTableElement("#table_customentities", "#tabCustomEntities");
    loadStickyTableElement("#table_other", "#tabOther");
}

function loadStickyTableElement(tableId, tabId) {
    $(tableId).stickyTableHeaders({
        scrollableArea: $(tabId)
        , fixedOffset: 1
        , marginTop: -1
    });
}

function loadTooltipRoles(privilegeId) {
    var roles = $('.role-row');
    $('#tooltip_content').html('None');

    if (roles.length > 0) {
        roles.each(function (index, item) {
            var role = _allRoles.Values.find(role => role.roleid == $(item).data('guid'));

            while (role.parentroleid) {
                role = _allRoles.Values.find(ele => ele.roleid == role.parentroleid);
            }

            if (!role.privileges || role.privileges.length < 1) { return true; }

            var privilege = role.privileges.find(priv => priv.privilegeid == privilegeId);

            if (!privilege) { return true; }
            if (getTooltipContent() == 'None') { $('#tooltip_content').html(''); }

            var additionalClass = translateDepthToCSSClass(privilege.privilegedepthmask);
            $('#tooltip_content').append('<div class="privilege_row"><div class="privilege_div privilege_empty tooltip_privilege ' + additionalClass + '"></div><div id="tooltip_role_name">' + role.name + '</div></div>');
        });
    } else {
        $('#tooltip_content').html("No roles available");
    }
}

function getTooltipContent() {
    return $('#tooltip_content').html();
}

function getPrivilegeDiv(privilegeMapping, type) {
    var privileges = privilegeMapping.Privileges;
    var privilege = privileges.find(priv => priv.Type == type);

    return privilege ? '<div class="privilege_div privilege_empty tooltipster" id="' + privilege.Id + '"></div>' : '';
}

function setPrivilegeInfo(privilege, privilegeName, privilegeType) {
    var privMapping = _allPrivilegesMapping.Values.find(priv => priv.PrivilegeBase == privilegeName);

    if (!privMapping) {
        privMapping = CRMHelper.SimorCPrivileges.createPrivilegeMapping(privilege, privilegeName, privilegeType);
    }

    if (!privMapping.Privileges) {
        privMapping.Privileges = [];
        setMappingDisplayName(privMapping);
    }

    var finalPrivilege = {};
    finalPrivilege.Id = privilege.privilegeid;
    finalPrivilege.Type = privilegeType;
    finalPrivilege.TypeCode = privilege.accessright;

    privMapping.Privileges.push(finalPrivilege);
}

function setMappingDisplayName(privMapping) {
    var x = privMapping;
    var displayObj = _allDisplayNames.Values.find(displayName => displayName.LogicalName == privMapping.PrivilegeBase.toLowerCase());

    if (displayObj) {
        try {
            var userLabel = displayObj.DisplayName.UserLocalizedLabel.Label;

            if (userLabel != privMapping.EntityName) {
                privMapping.EntityName = displayObj.DisplayName.UserLocalizedLabel.Label + ' (' + displayObj.LogicalName + ')';
            }
        } catch (e) { }
    }
}

function getDisplayNameByLogicalName(privilegeName) {
    var displayObj = _allDisplayNames.Values.find(displayName => displayName.LogicalName == privilegeName);

    if (displayObj) {
        try {
            return displayObj.DisplayName.UserLocalizedLabel.Label;
        } catch (e) {
            var description = 'Privilege Name: ' + privilegeName;
            description += '\ndisplayObj: ' + console.dir(displayObj);

            CRMHelper.Error.WriteErrorOnConsole('Display Name not found', description);
            return privilegeName + (' (N/A)');
        }
    } else {
        return privilegeName + (' (N/A)');
    }
}

function getUserCheckboxElement(guid, name, businessUnit) {
    var ret = '';
    ret += '<a href="#" class="list-group-item user-row" data-name="' + name.toLowerCase() + '" data-businessunitid="' + businessUnit + '" data-name="' + name + '" data-guid="' + guid + '" >';
    ret += name;
    ret += '</a>';

    return ret;
}

function getRoleCheckboxElement(guid, name, isDirectlyAssigned) {
    var extraClass = isDirectlyAssigned ? 'directly-assigned-role' : '';

    var ret = '';
    ret += '<div class="role-row ' + extraClass + '" data-guid="' + guid + '" data-name="' + name + '" data-selected="false">';
    ret += '    <label class="control checkbox pull-left">';
    ret += '        <input class="role-checkbox" type="checkbox" data-guid="' + guid + '" data-name="' + name + '" checked="true">';
    ret += '        <span class="checkbox-label checkbox-checked">' + name + '</span>';
    ret += '    </label>';
    ret += '    <i class="fa fa-trash pull-right role-delete-icon clickable-icon" title="Click to remove this role from this user." data-guid="' + guid + '" data-name="' + name + '" />';
    ret += '    <i class="fa fa-pencil pull-right role-edit-icon clickable-icon" title="Click to open this role in D365." data-guid="' + guid + '" data-name="' + name + '" />';
    ret += '    <i class="fa fa-user-o pull-right role-information-icon clickable-icon" title="Click to show all Users with this role." data-guid="' + guid + '" data-name="' + name + '" />';
    ret += '    <i class="fa fa-asterisk pull-left user-icon" style="display:none;" title="Directly assigned role for this user" />';
    ret += '    <i class="fa fa-users pull-right team-icon clickable-icon role-teams-icon" style="display:none;" title="This Role belongs in a Team. Click to highlight the Team(s)." />';
    ret += '</div>';

    return ret;
}

function getTeamCheckboxElement(guid, name, teamRoles) {
    var ret = '';

    ret += '<div class="team-row" data-guid="' + guid + '" data-name="' + name + '" data-selected="false">';
    ret += '    <span class="team-row-title">';
    ret += '        ' + name;
    ret += '    </span>';
    ret += '    <i class="fa fa-trash pull-right team-delete-icon clickable-icon" title="Click to remove this team from this user." data-guid="' + guid + '" data-name="' + name + '" />';
    ret += '    <i class="fa fa-pencil pull-right team-edit-icon clickable-icon" title="Click to open this team in D365." data-guid="' + guid + '" data-name="' + name + '" />';
    ret += '    <i class="fa fa-user-o pull-right team-information-icon clickable-icon" title="Click to show all Users with this role." data-guid="' + guid + '" data-name="' + name + '" />';

    if (teamRoles && teamRoles.length > 0) {
        ret += '    <i class="fa fa-key pull-right team-roles-icon clickable-icon" data-guid="' + guid + '" data-name="' + name + '" />';
    }
    ret += '</div>';

    return ret;
}

function addMockUsers(qty) {
    for (var i = 0; i < qty; i++) {
        var ele = getUserCheckboxElement('xxxx' + i, 'User ' + i);
        $('#list-users-col').append(ele);
    }

    $('.left-col').loading('stop');
}

function loadFullPrivileges() {
    if (_userRolesLoaded && _userTeamsLoaded) {
        var filter = '';

        $('.role-checkbox').each(function (index, item) {
            var initialRoleGuid = $(item).data('guid');
            var currentRole = _allRoles.Values.find(ele => ele.roleid == initialRoleGuid);

            while (currentRole.parentroleid) {
                currentRole = _allRoles.Values.find(ele => ele.roleid == currentRole.parentroleid);
            }

            if (!currentRole.privileges || currentRole.privileges.length == 0) {
                filter += ' or roleid eq ' + currentRole.roleid;
                currentRole.privileges = [];
            }
        });

        if (filter) {
            filter = 'roleprivilegeid eq null' + filter;
            CRMHelper.SimorCRoles.loadRolesPrivileges(filter);
        } else {
            loadPermissions();
        }
    }
}

function loadRolesCallback(currentUserRoles) {
    if (currentUserRoles) {
        currentUserRoles.forEach(function (item, index) {
            var currentRole = _allRoles.Values.find(ele => ele.roleid == item.roleid && ele.businessunitid == _currentBusinessUnit);

            var checkBox = getRoleCheckboxElement(currentRole.roleid, currentRole.name, true);
            $('#list-roles-col').append(checkBox);
        });
    }

    _userRolesLoaded = true;
    loadFullPrivileges();
}

function loadRolesFailCallback(req) {
    defaultError('Error loading User Roles', 'Roles load', req);
}

function loadTeamsCallback(currentUserTeams) {
    if (currentUserTeams) {
        currentUserTeams.forEach(function (item, index) {
            var currentTeam = _allTeams.Values.find(ele => ele.teamid == item.teamid);

            var checkBox = getTeamCheckboxElement(currentTeam.teamid, currentTeam.name, currentTeam.roles);
            $('#list-teams-col').append(checkBox);

            if (currentTeam.roles) {
                CRMHelper.SimorCTeams.addRolesFromTeam(currentTeam.roles);
            }
        });
    }

    _userTeamsLoaded = true;
    loadFullPrivileges();
}

function loadTeamsFailCallback(req) {
    defaultError('Error loading User Teams', 'Teams load', req);
}

function loadPermissions() {
    if (!_eventsLoaded) {
        loadRolesEvents();
        loadTeamsEvents();
        _eventsLoaded = true;
    }

    resetPrivileges();

    $('.role-checkbox:checked').each(function (index, item) {
        var roleId = $(item).data('guid');
        var currentRole = _allRoles.Values.find(ele => ele.roleid == roleId);

        while (currentRole.parentroleid) {
            currentRole = _allRoles.Values.find(ele => ele.roleid == currentRole.parentroleid);
        }

        var privileges = currentRole.privileges;

        if (privileges) {
            privileges.forEach(function (priv, privIndex) {
                $('#' + priv.privilegeid).addClass(translateDepthToCSSClass(priv.privilegedepthmask));
            });
        }
    });

    $('#roles-page').loading('stop');
}

function translateDepthToCSSClass(depth) {
    switch (depth) {
        case 1:
            return 'privilege_user';
        case 2:
            return 'privilege_bunit';
        case 4:
            return 'privilege_child_bunit';
        case 8:
            return 'privilege_organization';
        default:
            return '';
    }
}

function resetPrivileges() {
    $('.privilege_div:not(.tooltip_privilege)')
        .removeClass('privilege_user')
        .removeClass('privilege_bunit')
        .removeClass('privilege_child_bunit')
        .removeClass('privilege_organization');

    _userTeamsLoaded = false;
    _userRolesLoaded = false;
}

function resetPage() {
    $('#list-roles-col').html('');
    $('#list-teams-col').html('');
    $('#list-roles-col').loading('stop');
    $('#list-teams-col').loading('stop');
    $('#list-permissions-col').loading('stop');
    $('#chkAllRoles').prop('checked', true);
    $('#highlightedRoles').html('');
    resetPrivileges();
}

function highlightRows(evElement, titleId, targetRowClass, sourceRowClass, highlightIds) {
    var selected = $(evElement).data('selected');
    var name = $(evElement).data('name');
    var finalIdsCount = 0;

    $('.' + targetRowClass).removeClass('selected');
    $('.' + sourceRowClass).data('selected', false);
    $('#' + titleId).html('');

    if (!selected) {
        idsCount = highlightIds && highlightIds.length > 0 ? highlightIds.length : 0;

        $(evElement).data('selected', true);

        if (highlightIds && idsCount > 0) {
            highlightIds.forEach(function (item, index) {
                var ele = $('.' + targetRowClass + '[data-guid="' + item + '"]');
                if (ele.length > 0) {
                    ele.addClass('selected');
                    finalIdsCount++;
                }
            });
        }
    }
}

$('.dropdown-menu-item').click(function (e) {
    var selectedOption = $(this).text();

    if (selectedOption == 'All') {
        $('.user-row').toggle(true);
    } else if (selectedOption == 'Active') {
        showUserRows(true);
    } else if (selectedOption == 'Inactive') {
        showUserRows(false);
    }

    $('.dropdown-toggle-title').text(selectedOption);
    e.preventDefault();
});

$('#btnExport').click(function () {
    if (!isUserSelected()) {
        return;
    }

    $(".tab-container.active").scrollTop(0);

    CRMHelper.SimorCExport.WriteReport();
});

$('#btnChangeRoles').click(function () {
    if (isUserSelected()) {
        setChangesModalInfo(true, null, _allroles);
    }
});

$('#btnChangeTeams').click(function () {
    if (isUserSelected()) {
        setChangesModalInfo(false, null, _allTeams);
    }
});

$('#list-roles-col').on('change', '.role-checkbox', function () {
    $('#chkAllRoles').prop('checked', $('.role-checkbox:checked').length == $('.role-checkbox').length);
    $(this).next('.checkbox-label').toggleClass('checkbox-checked');
    loadPermissions();
});

$('#chkAllRoles').change(function () {
    $('.role-checkbox').prop('checked', $(this).prop('checked'));
    $('.role-checkbox').next('.checkbox-label').toggleClass('checkbox-checked', $(this).prop('checked'));
    loadPermissions();
});

function loadRolesEvents() {
    $('#list-roles-col').on('click', '.role-teams-icon', function () {
        var roleId = $(this).parent().data('guid');
        var teamsIds = CRMHelper.SimorCTeams.getTeamsByRoleId(roleId);
        $('#list-roles-col .clickable-icon').not(this).removeClass('selected');
        $(this).toggleClass('selected');

        highlightRows($(this).parent(), 'highlightedTeams', 'team-row', 'role-row', teamsIds);
    });

    $('#list-roles-col').on('click', '.role-information-icon', function () {
        var roleId = $(this).data('guid');
        var roleName = $(this).data('name');
        var users = CRMHelper.SimorCUsers.getUsersByRoleId(roleId);

        setModalInfo(users, roleName, roleId, true);
    });

    $('#list-roles-col').on('click', '.role-edit-icon', function () {
        var roleId = $(this).data('guid');
        var roleName = $(this).data('name');
        var url = Xrm.Page.context.getClientUrl() + '/biz/roles/edit.aspx?id=%7b' + roleId + '%7d';

        window.open(url, "_blank");
    });

    $('#list-roles-col').on('click', '.role-delete-icon', function () {
        var userId = $('#list-users-col').find('.active').data('guid');
        var roleId = $(this).data('guid');
        var roleName = $(this).data('name');

        if (CRMHelper.SimorCUsers.checkIfAdmin(userId, roleName)) {
            showNotifyMessage('danger', 'Error', "Can't remove System Administrator access from yourself.", 1500);
            return;
        }

        var response = confirm("Are you sure you want to delete " + roleName + "?");
        if (response) {
            CRMHelper.Data.WebAPI.Disassociate("systemuser", userId, "systemuserroles_association(" + roleId + ")", true, CRMHelper.SimorCRoles.deleteRoleCallback, CRMHelper.SimorCRoles.deleteRoleFailCallback);
        }
    });
}

function loadTeamsEvents() {
    $('#list-teams-col').on('click', '.team-roles-icon', function () {
        var teamId = $(this).parent().data('guid');
        var rolesIds = CRMHelper.SimorCRoles.getRolesByTeamId(teamId);
        $('#list-teams-col .clickable-icon').not(this).removeClass('selected');
        $(this).toggleClass('selected');

        highlightRows($(this).parent(), 'highlightedRoles', 'role-row', 'team-row', rolesIds);
    });

    $('#list-teams-col').on('click', '.team-information-icon', function () {
        var teamId = $(this).data('guid');
        var teamName = $(this).data('name');
        var users = CRMHelper.SimorCUsers.getUsersByTeamId(teamId);

        setModalInfo(users, teamName, teamId, false);
    });

    $('#list-teams-col').on('click', '.team-edit-icon', function () {
        var teamId = $(this).data('guid');
        var teamName = $(this).data('name');
        var url = Xrm.Page.context.getClientUrl() + '/main.aspx?etc=9&extraqs=&histKey=951623712&id=%7b' + teamId + '%7d&newWindow=true&pagetype=entityrecord&sitemappath=Settings%7cSystem_Setting%7cnav_security';

        window.open(url, "_blank");
    });

    $('#list-teams-col').on('click', '.team-delete-icon', function () {
        var userId = $('#list-users-col').find('.active').data('guid');
        var teamId = $(this).data('guid');
        var teamName = $(this).data('name');

        var response = confirm("Are you sure you want to delete " + teamName + "?");
        if (response) {
            CRMHelper.Data.WebAPI.Disassociate("team", teamId, "teammembership_association(" + userId + ")", true, CRMHelper.SimorCTeams.deleteTeamCallback, CRMHelper.SimorCTeams.deleteTeamFailCallback);
        }
    });
}

function setModalInfo(users, name, guid, isRole) {
    resetModal();

    var bodyMessage = '';
    var headerText = '';

    if (isRole) {
        headerText = 'Information for role "<strong>' + name + '</strong>"';
    } else {
        headerText = 'Information for team "<strong>' + name + '</strong>"';
    }

    $('#modalHeader').html(headerText);
    $('#modalBody1').html(bodyMessage);

    $('#heading-number-users').html(users.length);

    for (var i = 0; i < users.length; i++) {
        $('#modalMid').append('<li>' + users[i] + '</li>');
    }

    $('#btnModalConfirm').prop('disabled', false);
    $("#modalConfirmation").modal();
}

function setChangesModalInfo(isRole) {
    resetChangesModal();

    var headerText = isRole ? "Add roles" : "Add teams";
    $('#modalChangesHeader').html(headerText);

    if (isRole) {
        setChangesModalRoles();
    } else {
        setChangesModalTeams();
    }

    $("#modalChanges").modal();
}

function resetModal() {
    $('#modalHeader').html('');
    $('#modalMid').html('');
}

function resetChangesModal() {
    $('#modalChangesHeader').html('');
    $('#modalChangesMid1').html('');
    $('#modalChangesMid2').html('');
}

function setChangesModalRoles() {
    $("#modalChangesMid").html("");
    $("#btnModalConfirmTeam").hide();
    $("#btnModalConfirmRole").show();
    var userId = $('#list-users-col').find('.active').data('guid');

    CRMHelper.SimorCRoles.getUserRolesIds(userId, setChangesModalRolesCallback, setChangesModalRolesFailCallback);
}

function setChangesModalRolesCallback(currentUserRoles) {
    var currentUserIds = $.map(currentUserRoles, current => current.roleid);
    var roles = _allRoles.Values.filter(role => currentUserIds.indexOf(role.roleid) < 0);

    for (let i in roles) {
        var row = "";
        row += '<div class="add-row add-team-row" data-guid="' + roles[i].roleid + '" data-name="' + roles[i].name + '" data-selected="false">';
        row += '    <label class="control checkbox pull-left">';
        row += '        <input class="add-role-checkbox" type="checkbox" data-guid="' + roles[i].roleid + '" data-name="' + roles[i].name + '">';
        row += '        <span class="checkbox-label checkbox-checked">' + roles[i].name + '</span>';
        row += '    </label>';
        row += '</div>';

        $("#modalChangesMid").append(row);
    }
}

function setChangesModalRolesFailCallback() {
    defaultError('Error adding Role(s)', 'Roles add', req);
}

function setChangesModalTeams() {
    $("#modalChangesMid").html("");
    $("#btnModalConfirmTeam").show();
    $("#btnModalConfirmRole").hide();

    var userId = $('#list-users-col').find('.active').data('guid');
    CRMHelper.SimorCTeams.getUserTeamsIds(userId, setChangesModalTeamsCallback, setChangesModalTeamsFailCallback);
}

function setChangesModalTeamsCallback(currentUserTeams) {
    var currentUserIds = $.map(currentUserTeams, current => current.teamid);
    var teams = _allTeams.Values.filter(team => currentUserIds.indexOf(team.teamid) < 0);

    for (let i in teams) {
        var row = "";
        row += '<div class="add-row add-team-row" data-guid="' + teams[i].teamid + '" data-name="' + teams[i].name + '" data-selected="false">';
        row += '    <label class="control checkbox pull-left">';
        row += '        <input class="add-team-checkbox" type="checkbox" data-guid="' + teams[i].teamid + '" data-name="' + teams[i].name + '">';
        row += '        <span class="checkbox-label checkbox-checked">' + teams[i].name + '</span>';
        row += '    </label>';
        row += '</div>';

        $("#modalChangesMid").append(row);
    }
}

function setChangesModalTeamsFailCallback() {
    defaultError('Error adding Team(s)', 'Teams add', req);
}

function isUserSelected() {
    if ($('.user-row.active').length == 0) {
        showNotifyMessage('danger', 'Error', 'Please select a user first!', 1500);
        return false;
    } else {
        return true;
    }
}