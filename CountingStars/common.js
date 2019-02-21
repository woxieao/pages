var loginCore = {
    LoginNameKey: "LoginName",
    LoginPage: "login.html",
    IndexPage: "index.html",
    CheckIsLogin: function () {
        if (!localStorage.getItem(loginCore.LoginNameKey) && location.pathname.toLowerCase().indexOf(loginCore.LoginPage) === -1) {
            location.href = loginCore.LoginPage;
            return false;
        }
        return true;
    },
    GetLoginId: function () {
        if (loginCore.CheckIsLogin()) {
            return localStorage.getItem(loginCore.LoginNameKey);
        } else {
            return '';
        }
    }
};
function getQueryStringByName(name) {
    var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {

        return "";
    }
    return result[1];
}
loginCore.CheckIsLogin();