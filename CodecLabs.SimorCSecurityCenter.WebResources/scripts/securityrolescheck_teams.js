var CRMHelper = (function (helper) {

    var teamsCode = {
        getUserTeamsIds: (userId, callback, failCallback) => {
            var entityName = 'teammembership';
            var select = 'teamid';
            var filter = 'systemuserid eq ' + userId;

            return CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, filter, null, null, null, true, callback, failCallback);
        },
        addRolesFromTeam: (teamRoles) => {
            teamRoles.forEach(function (item, index) {
                var existingRoleItem = $('.role-row[data-guid="' + item + '"]');
                if (existingRoleItem && existingRoleItem.length > 0) {
                    existingRoleItem.addClass('role-from-team');
                } else {
                    var roleName = _allRoles.Values.find(ele => ele.roleid == item).name;
                    var newRoleItem = $(getRoleCheckboxElement(item, roleName, false)).addClass('role-from-team');
                    $('#list-roles-col').append(newRoleItem);
                }
            });
        },
        loadAllTeams: () => {
            var entityName = 'team';
            var select = 'teamid,name';

            CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, null, null, null, null, true, teamsCode.loadAllTeamsCallback, teamsCode.loadAllTeamsFailCallback);
        },
        loadAllTeamsCallback: (result) => {
            if (result && result.length > 0) {
                result.forEach(function (item, index) {
                    _allTeams.Values.push({ teamid: item.teamid, name: item.name })
                });

                _allTeams.Loaded = true;

                if (_allRoles.Loaded === true) {
                    CRMHelper.SimorCRoles.loadAllTeamRoles();
                }
            }
        },
        loadAllTeamsFailCallback: (req) => {
            defaultError('Error loading Teams', 'Teams load', req);
        },
        getTeamsByRoleId: (roleId) => {
            var teamsIds = _allTeams.Values.filter(team => team.roles && team.roles.find(role => role == roleId) != null);
            return teamsIds.map(team => team.teamid);
        },
        deleteTeamCallback: () => {
            $('#list-users-col').find('.active').click();
            showNotifyMessage('success', 'Success', 'Team deleted!', 1500);
        },
        deleteTeamFailCallback: (req) => {
            defaultError('Error deleting Team', 'Delete Team', req);
        }
    }

    helper.SimorCTeams = teamsCode;
    return helper;

}(CRMHelper || {}));