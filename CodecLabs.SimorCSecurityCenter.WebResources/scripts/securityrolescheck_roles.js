var CRMHelper = (function (helper) {

    var rolesCode = {
        getUserRolesIds: (userId, callback, failCallback) => {
            var entityName = 'systemuserroles';
            var select = 'roleid';
            var filter = 'systemuserid eq ' + userId;

            return CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, filter, null, null, null, true, callback, failCallback);
        },
        loadRolesPrivileges: (filter) => {
            var entityName = 'roleprivileges';
            var select = 'privilegeid,privilegedepthmask,roleid';

            CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, filter, null, null, null, true, rolesCode.loadRolesPrivilegesCallback, rolesCode.loadRolesPrivilegesFailCallback);
        },
        loadRolesPrivilegesCallback: (result) => {
            if (result) {
                result.forEach(function (item, index) {
                    var currentRole = _allRoles.Values.find(ele => ele.roleid == item.roleid);
                    var currentPrivilege = {};

                    currentPrivilege.privilegeid = item.privilegeid;
                    currentPrivilege.privilegedepthmask = item.privilegedepthmask;
                    currentRole.privileges.push(currentPrivilege);
                });
            }

            loadPermissions();
        },
        loadRolesPrivilegesFailCallback: () => {
            defaultError('Error loading Privileges', 'Privileges load', req);
        },
        loadAllRoles: () => {
            var entityName = 'role';
            var select = 'roleid,name,roleidunique,_businessunitid_value,_parentroleid_value';

            CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, null, null, null, null, true, rolesCode.loadAllRolesCallback, rolesCode.loadAllRolesFailCallback);
        },
        loadAllRolesCallback: (result) => {
            if (result && result.length > 0) {
                result.forEach(function (item, index) {
                    _allRoles.Values.push({ roleid: item.roleid, name: item.name, roleidunique: item.roleidunique, businessunitid: item._businessunitid_value, parentroleid: item._parentroleid_value })
                });

                _allRoles.Loaded = true;

                if (_allTeams.Loaded === true) {
                    rolesCode.loadAllTeamRoles();
                }
            }
        },
        loadAllRolesFailCallback: (req) => {
            defaultError('Error loading Roles', 'Roles load', req);
        },
        loadAllTeamRoles: () => {
            var entityName = 'teamroles';
            var select = 'teamid,roleid';

            CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, null, null, null, null, true, rolesCode.loadAllTeamRolesCallback, rolesCode.loadAllTeamRolesFailCallback);
        },
        loadAllTeamRolesCallback: (result) => {
            if (result && result.length > 0) {
                var groupedTeams = result.reduce(function (r, a) {
                    r[a.teamid] = r[a.teamid] || [];
                    r[a.teamid].push(a.roleid);
                    return r;
                }, Object.create(null));

                if (groupedTeams) {
                    for (var i in groupedTeams) {
                        _allTeams.Values.find(ele => ele.teamid == i).roles = groupedTeams[i];
                    }
                }
            }

            showWaitingMessage();
        },
        loadAllTeamRolesFailCallback: (req) => {
            defaultError('Error loading Team Roles', 'Team Roles load', req);
        },
        getRolesByTeamId: (teamId) => {
            var team = _allTeams.Values.find(ele => ele.teamid == teamId);

            return team.roles;
        },
        deleteRoleCallback: () => {
            $('#list-users-col').find('.active').click();
            showNotifyMessage('success', 'Success', 'Role deleted!', 1500);
        },
        deleteRoleFailCallback: (req) => {
            defaultError('Error deleting Role', 'Delete Role', req);
        }
    }

    helper.SimorCRoles = rolesCode;
    return helper;

}(CRMHelper || {}));