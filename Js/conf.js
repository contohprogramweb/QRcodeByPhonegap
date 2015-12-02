$(document).on("mobileinit", function () {
	//解决JQM页面切换闪屏问题
	$.mobile.defaultPageTransition = 'none';
	$.mobile.ajaxEnabled = false;
	//$.mobile.defaultDialogTransition = 'none'; 
});

var CONTROLDOMINNAME = "http://dmnqmn1.duapp.com/microcloud_INT.py?";//控制服务器URL
var READDOMINNAME = "http://dmnqmn1.duapp.com/microcloud_SHOW.py?a=dirjegoifngoas1ddjogireoijvoirgkfdergdfiuregnrgireginrieguhsghui";//获取资源链接

//获取到当前URL中的 参数值 news_con.html?id=X  需要获取到现在的 X 值
function getUrlParam(url, strVar){
	arg = url.split(strVar);
	return arg[1];
}