export const myAppData = (state = {}, actions) => {
  switch (actions.type) {
    case 'UPDATE_MYAPPLIST':
      return actions.data;
    default:
      return state;
  }
};

export const isHomeLoading = (state = true, action) => {
  switch (action.type) {
    case 'MOBILE_FETCHHOMELIST_START':
      return true;
    case 'MOBILE_FETCHHOMELIST_SUCCESS':
      return false;
    default:
      return state;
  }
};

export const platformSetting = (state = {}, action) => {
  switch (action.type) {
    case 'PLATE_FORM_SETTING':
      return action.data;
    default:
      return state;
  }
};
export const myPlatformData = (state = {}, action) => {
  switch (action.type) {
    case 'PLATE_FORM_DATA':
      return action.data;
    default:
      return state;
  }
};

export const collectRecords = (state = [], action) => {
  switch (action.type) {
    case 'COLLECT_RECORDS':
      return action.data;
    default:
      return state;
  }
};
