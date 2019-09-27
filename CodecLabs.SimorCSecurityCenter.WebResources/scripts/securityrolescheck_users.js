var CRMHelper = (function (helper) {
    var userCode = {
        loadUsers: () => {
            var select = 'systemuserid,fullname,_businessunitid_value';
            CRMHelper.Data.WebAPI.ExecuteQuery('systemuser', select, 'isdisabled eq false', null, 'fullname asc', null, true, userCode.loadUsersCallback, userCode.loadUsersErrorCallback);
        },
        loadUsersCallback: (allUsers) => {
            _allUsers = allUsers;
            for (var i = 0; i < allUsers.length; i++) {
                var user = allUsers[i];
                var rowUser = getUserCheckboxElement(user.systemuserid, user.fullname, user._businessunitid_value);
                $('#list-users-col').append(rowUser);
            }
        },
        loadUsersErrorCallback: (req) => {
            defaultError('Error loading Users', 'Users Column - Users', req);
        },
        getUsersByTeamId: (teamId) => {
            var entityName = "teammembership";
            var select = "systemuserid";
            var filter = "teamid eq " + teamId;

            var userIds = CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, filter, null, null, null, false);

            return userCode.getUserNamesByUserIds(userIds);
        },
        getUsersByRoleId: (roleId) => {
            var entityName = "systemuserroles";
            var select = "systemuserid";
            var filter = "roleid eq " + roleId;

            var userIds = CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, filter, null, null, null, false);

            return userCode.getUserNamesByUserIds(userIds);
        },
        getUserNamesByUserIds: (userIds) => {
            var users = [];

            for (var i in userIds) {
                var user = _allUsers.find(user => user.systemuserid == userIds[i].systemuserid);
                if (user) { // Ignore inactive users
                    users.push(user.fullname.trim());
                }
            }

            return users.sort();
        },
        checkIfAdmin: (userId, roleName) => {
            var currentUserId = Xrm.Page.context.getUserId().replace('{', '').replace('}', '');
            return userId.toLowerCase() == currentUserId.toLowerCase() && roleName == "System Administrator";
        }
    }

    helper.SimorCUsers = userCode;
    return helper;

}(CRMHelper || {}));