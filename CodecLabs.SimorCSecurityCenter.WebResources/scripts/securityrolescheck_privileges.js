var CRMHelper = (function (helper) {
    var privilegeCode = {
        loadPrivilegesMapping: () => {
            $.getJSON('../json/Privileges_Mapping.js', privilegeCode.loadPrivilegesMappingCallback)
                .fail(privilegeCode.loadPrivilegesMappingFailCallback);
        },
        loadPrivilegesMappingCallback: (result) => {
            _allPrivilegesMapping.Values = result;
            _allPrivilegesMapping.Loaded = true;

            privilegeCode.loadPrivilegesHTML();
        },
        loadPrivilegesMappingFailCallback: (req, status, error) => {
            defaultError('Error loading Privileges Mapping', 'Privileges Mapping load', req);
        },
        loadPrivileges: () => {
            var entityName = 'privilege';
            var select = 'accessright,privilegeid,name';
            CRMHelper.Data.WebAPI.ExecuteQuery(entityName, select, null, null, null, null, true, privilegeCode.loadPrivilegesCallback, privilegeCode.loadPrivilegesFailCallback);
        },
        loadPrivilegesCallback: (result) => {
            _allPrivileges.Values = result;
            _allPrivileges.Loaded = true;

            privilegeCode.loadPrivilegesHTML();
        },
        loadPrivilegesFailCallback: (req) => {
            defaultError('Error loading Privileges', 'Privileges load', req);
        },
        loadPrivilegesHTML: () => {
            if (_allDisplayNames.Loaded && _allPrivilegesMapping.Loaded && _allPrivileges.Loaded) {
                privilegeCode.setMappings();
                privilegeCode.orderMappings();
                _allPrivilegesMapping.Values.forEach(function (item, index) {
                    try {
                        if (!item.IsMisc && !item.IsPrivacy) {
                            var html = '';
                            html += '<tr>';
                            html += '   <td>';
                            html += '       ' + item.EntityName;
                            html += '   </td>';
                            html += '   <td>'; // Create
                            html += '       ' + getPrivilegeDiv(item, 'Create');
                            html += '   </td>';
                            html += '   <td>'; // Read
                            html += '       ' + getPrivilegeDiv(item, 'Read');
                            html += '   </td>';
                            html += '   <td>'; // Write
                            html += '       ' + getPrivilegeDiv(item, 'Write');
                            html += '   </td>';
                            html += '   <td>'; // Delete
                            html += '       ' + getPrivilegeDiv(item, 'Delete');
                            html += '   </td>';
                            html += '   <td>'; // Append
                            html += '       ' + getPrivilegeDiv(item, 'Append');
                            html += '   </td>';
                            html += '   <td>'; // Append To	
                            html += '       ' + getPrivilegeDiv(item, 'AppendTo');
                            html += '   </td>';
                            html += '   <td>'; // Assign
                            html += '       ' + getPrivilegeDiv(item, 'Assign');
                            html += '   </td>';
                            html += '   <td>'; // Share
                            html += '       ' + getPrivilegeDiv(item, 'Share');
                            html += '   </td>';
                            html += '</tr>';

                            $('#tbl_' + item.TabName).append(html);
                        } else {
                            var html = '';
                            html += '<tr>';
                            html += '   <td>';
                            html += '       ' + item.EntityName;
                            html += '   </td>';
                            html += '   <td>';
                            html += '       <div class="privilege_div privilege_empty tooltipster" id="' + item.Privileges[0].Id + '"></div>';
                            html += '   </td>';
                            html += '</tr>';

                            var htmlSuffix = item.IsMisc ? '_misc' : '_privacy';
                            var eleId = '#tbl_' + item.TabName + htmlSuffix;
                            $(eleId).append(html);
                        }
                    } catch (e) {
                        console.log('Nope: ' + item.EntityName);
                    }
                });

                $('.left-col').loading('stop');
                $('#list-permissions-col').loading('stop');

                loadTooltipster();
                loadStickyTable();
            }
        },
        setMappings: () => {
            _allPrivileges.Values.forEach(function (item, index) {
                var privilegeName = '';
                var privilegeType = '';

                switch (item.accessright) {
                    case 1: // Read
                        privilegeName = item.name.replace('prvRead', '').replace('prvConfigure', '');
                        privilegeType = 'Read';
                        break;
                    case 2: // Write
                        privilegeName = item.name.replace('prvWrite', '');
                        privilegeType = 'Write';
                        break;
                    case 4: // Append
                        privilegeName = item.name.replace('prvAppend', '');
                        privilegeType = 'Append';
                        break;
                    case 16: // AppendTo
                        privilegeName = item.name.replace('prvAppendTo', '');
                        privilegeType = 'AppendTo';
                        break;
                    case 32: // Create
                        privilegeName = item.name.replace('prvCreate', '').replace('prvConfigure', '');
                        privilegeType = 'Create';
                        break;
                    case 65536: // Delete
                        privilegeName = item.name.replace('prvDelete', '');
                        privilegeType = 'Delete';
                        break;
                    case 262144: // Share
                        privilegeName = item.name.replace('prvShare', '');
                        privilegeType = 'Share';
                        break;
                    case 524288: // Assign
                        privilegeName = item.name.replace('prvAssign', '');
                        privilegeType = 'Assign';
                        break;
                    default:
                        privilegeName = item.name.replace('prvRead', '').replace('prvConfigure', '').replace('prvCreate', '');
                        privilegeType = 'Other';
                        break;
                }

                setPrivilegeInfo(item, privilegeName, privilegeType);
            });
        },
        orderMappings: () => {
            _allPrivilegesMapping.Values.sort(function (a, b) {
                var textA = a.EntityName.toUpperCase();
                var textB = b.EntityName.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
        },
        createPrivilegeMapping: (privilege, privilegeName, privilegeType) => {
            var customPrivMapping = {};
            var displayName = getDisplayNameByLogicalName(privilegeName);

            customPrivMapping.EntityName = displayName;
            customPrivMapping.IsMisc = false;
            customPrivMapping.IsPrivacy = false;
            customPrivMapping.PrivilegeBase = privilegeName;
            customPrivMapping.TabName = displayName.indexOf('(N/A)') > 0 ? 'Other' : 'CustomEntities';

            _allPrivilegesMapping.Values.push(customPrivMapping);
            return customPrivMapping;
        },

    }

    helper.SimorCPrivileges = privilegeCode;
    return helper;

}(CRMHelper || {}));