//当来到操作主板页面opr_board.html时触发事件
$(document).on("pageinit","#opr_board",function(){
	/*
	进入 操作主板页面 opr_board.html 时触发事件   
	①检查该客户端之前是否已经存在主板，如果不存在需要跳转到扫描主板页面
	②如果存在的话，即拿到当前操作的主板的ID

	判断是否存在主板步骤:
			1、在localStorage中存放一个ITEM [board_count] ，专门存储主板个数，提取出来判断是否为0
			2、在localStorage中存放一个ITEM [crt_board_id]，专门存储当前选中的主板的ID
	*/
	if(localStorage.getItem('board_count') == null){
		/*	判断是否存在主板
			通过判断是否[board_count] 是否为 null 如果为null 证明是第一次登陆
		*/
		//第一次登陆
		localStorage.setItem('board_count', 0);//设定主板数量
		localStorage.setItem('crt_board_id', 0);//设定当前选中主板ID
		localStorage.setItem('mb_max_id', 0);//当前主板表中最大主键数
		localStorage.setItem('socket_max_id', 0);//当前插座表中最大的主键数
		
		//是第一次登陆，需要到使用帮助页面
		window.location.href = "opr_board.html#first_scan";
	}else{
		//已经不是第一次登陆啦,需要判断当前的localStorage.getItem('board_count')是否为0
		if(parseInt(localStorage.getItem('board_count')) == 0){
			//跳转到中间解释页面
			window.location.href = "opr_board.html#first_scan";
		}else{
			//alert(localStorage.getItem('crt_board_id'));
			//如果客户端已经扫描过主板，还是需要判断当前选中了哪个主板
			if(parseInt(localStorage.getItem('crt_board_id')) == 0){
				//如果等于 0 说明现在没有具体选中某个主板,那么需要到切换主板页面去进行选中
				window.location.href = "opr_board.html#swt_board";
				return false;
			}else{
				//存在主板，并且当前已经选中了一个主板
				//通过localStorage中获取当前选中主板的信息
				var crt_bd_id = parseInt(localStorage.getItem('crt_board_id'));//主板ID
				//通过主板ID到数据库中将主板的名称取出
				db.transaction(function(tx){
					tx.executeSql("SELECT number,title FROM mainboards WHERE id="+crt_bd_id, [] ,function(tx, rs){
						if(rs.rows.length == 0){
							//如果localStorage中存在当前选中的主板ID，但是到数据库中并没有查找到这个主板ID的title，证明发生了未知错误
							//这个时候需要进行一个处理，如果localStorage['board_count'] ==0 到扫描页面(index.html) 如果!=0 那么跳转到切换主板页面
							if(localStorage.getItem('board_count') == 0){
								window.location.href = "index.html";
								return false;
							}else{
								window.location.href = "opr_board.html#swt_board";
								return false;
							}
						}
						$(".crt_bd_title").html(rs.rows.item(0).title);//将当前选中的主板的title添加到页面的头部
					});
				});
				alert("fff");
				//取得当前主板下的插座
				db.transaction(function(tx){
					tx.executeSql("SELECT number,id, title, active FROM sockets WHERE mb_id="+crt_bd_id, [] ,function(tx, rs){
						var len = rs.rows.length;
						alert(len);
						if( len == 0){
							//当前主板下无插座
							$("#sockets_list").html("当前主板下无插座<br/><a href='index.html' data-ajax='false' data-role='button'>添加插座</a>");
							$("#sockets_list").show(20);
						}else{
							//alert(len);
							var crt_board_id = localStorage.getItem('crt_board_id');
							for(var i = 0; i < len; i++){
								skt_list = '<a href="#" data-role="button" class="ui-link ui-btn  ui-shadow ui-corner-all" role="button">'+rs.rows.item(i).title+'</a><br/><a href="#" data-role="button" data-inline="true" class="ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all" role="button" board_id="'+rs.rows.item(i).number+'" onclick="change_socket_on_off(this)" onOff="a">开启</a><a href="#" data-role="button" data-inline="true" class="ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all" role="button" board_id="'+rs.rows.item(i).number+'" onclick="change_socket_on_off(this)" onOff="b">关闭</a><br/>';
								$(skt_list).appendTo($("#sockets_list"));
							}
							$("#sockets_list").fadeIn(40);
						}
					});
				});
			}
		}
	}
});


//当来到编辑主板页面opr_board.html#ed_board时触发事件
$(document).on("pageinit","#ed_board",function(){
	//获取当前主板的名称 sql[title]
	var crt_bd_id = parseInt(localStorage.getItem('crt_board_id'));//主板ID
	db.transaction(function(tx){
		tx.executeSql("SELECT title FROM mainboards WHERE id="+crt_bd_id, [] ,function(tx, rs){
			if(rs.rows.length == 0){
				alert("当前主板不存在");
			}
			$("#main_board_title").val(rs.rows.item(0).title);//将当前选中的主板的title添加到页面的头部
			$("#main_board_title").attr('class',localStorage.getItem('crt_board_id'));//将当前主板ID存放在输入框的class属性中
		});
	});
	//获取当前主板下的插座
	db.transaction(function(tx){
		tx.executeSql("SELECT * FROM sockets WHERE mb_id="+crt_bd_id, [] ,function(tx, rs){
			var len = rs.rows.length;
			if(len == 0){
				$("#mb_sockets").html('<h5>当前主板暂无插座</h5><br/><a href="#" data-role="button">点击添加</a>');
				return false;
			}else{
				var socket_list = "";
				for(var i = 0; i < len; i++){
					//将插座一个个的添加到页面中
					socket_list = "<div class='ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset'><input type='text' id='socket_list' class='"+rs.rows.item(i).id+"' value='"+rs.rows.item(i).title+"'></div>";
					$(socket_list).appendTo($("#mb_sockets"));
					//如果该插座显示未激活 提示
					if(rs.rows.item(i).active == 'n'){
					var not_active_sockets = "<p>该插座未激活,请按照说明书,进行激活。"+rs.rows.item(i).active+"<a href='#' onclick='opr_socket_active("+rs.rows.item(i).id+", this)' data-role='button' data-inline='true'>点击激活</a></p>";
						$(not_active_sockets).appendTo($("#mb_sockets"));
					}
				} 
			}
		});
	});
	
	//编辑主板和插座完成，点击确定
	$("#yes_ed_board").click(function(){
		var board_id = $("#main_board_title").attr('class');//需要修改的主板ID
		var board_new_title = $("#main_board_title").val();//主板新名称
		//执行修改主板信息
		db.transaction(function(tx){  
			tx.executeSql("UPDATE mainboards set title='"+board_new_title+"' WHERE id="+board_id, [] ,function(tx, rs){  
				//alert('成功修改表');  
			});
		});
		//执行修改插座信息
		$("#mb_sockets #socket_list").each(function(){			
			var socket_id = $(this).attr('class');//插座ID
			var socket_new_title = $(this).val();//插座新title
			//执行修改
			db.transaction(function(tx){  
				tx.executeSql("UPDATE sockets set title='"+socket_new_title+"' WHERE id="+socket_id, [] ,function(tx, rs){  
					alert('成功修改插座'+socket_id);
				});
			});
		});
		alert('修改成功');
		setTimeout("window.location.href = 'opr_board.html'",100);
	});

	//永久删除当前主板
	$("#del_mainboard").click(function(){
		var crt_mb_id = localStorage.getItem('crt_board_id');//当前选中主板ID
		//删除当前主板下的插座
		db.transaction(function(tx){
			tx.executeSql('DELETE FROM sockets WHERE mb_id='+crt_mb_id, [] ,function(tx, rs){
				alert('成功删除主板下的插座');
			});
		});
		//删除当前主板
		db.transaction(function(tx){
			tx.executeSql('DELETE FROM mainboards WHERE id='+crt_mb_id, [] ,function(tx, rs){
				alert('成功删除当前主板');
			});
		});
		/*
			因为现在已经删除了主板，所以说当前主板并未选中，首先需要将local ['board_count']-1
			当前也没有选中的主板，所以将local[crt_board_id] 赋值 数据库中最新添加的那个主板的ID
		*/
		var temp_mb_count = parseInt(localStorage.getItem('board_count'))-1;
		localStorage.setItem('board_count', temp_mb_count);
		if(temp_mb_count > 0){
			db.transaction(function(tx){
				tx.executeSql("SELECT id FROM mainboards ORDER BY time desc limit 0, 1", [] ,function(tx, rs){
					localStorage.setItem('crt_board_id', rs.rows.item(0).id);
				});
			});
		}else{
			//如果将这个主板删除后,主板个数已经为0,那么将当前的主板ID变为0
			localStorage.setItem('crt_board_id', 0);
			window.location.href = "opr_board.html#first_scan";
			return false;
		}
	});
});
//激活插座
function opr_socket_active(active_socket_id,obj){
	getIp();
	alert(localStorage.getItem('BOARD_IP'));
	BOARD_DOMIN = localStorage.getItem('BOARD_IP');
	$.ajax({
		url:"http://"+BOARD_DOMIN+"/cgi-bin/test.cgi?microcloud",
		type:"post",
		dataType:"text",
		timeout:100,//设置0.1秒检查内网
		success:function(data){
			data = data.trim();
			if(data == "microcloud"){
				//alert("走内网");
				db.transaction(function(tx){
					tx.executeSql("SELECT * FROM sockets WHERE id="+active_socket_id, [] ,function(tx, rs){
						alert(active_socket_id);
						if(rs.rows.length == 0){
							//没有拿到需要激活的插座 ID
							alert('运行出错,建议重启。');
							return false;
						}
						var send_active_str = "BACK"+rs.rows.item(0).number.substr(0,1);
						$.ajax({
							url:"http://"+BOARD_DOMIN+"/cgi-bin/test.cgi?"+send_active_str,
							type:"post",
							dataType:"text",
							success:function(data){
								data = data.trim();//清除两边空格
								if(data.substr(1,1) == "Y"){
									//执行对本地数据库的修改
									db.transaction(function(tx){  
										tx.executeSql("UPDATE sockets set active='y' WHERE id="+active_socket_id, [] ,function(tx, rs){  
											var par_obj = obj.parentNode;//获取父节点(div)对象  
											par_obj.innerHTML = "<p><font color='red'>已成功激活!</font></p>";
											//成功激活 并且修改了客户端的 socket表中的 active n->y
											return false;
										},function(tx,error){
											alert('激活失败!');
											alert(error.source + ":" + error.message);
											return false;
										});
									});
								}else{
									alert('激活失败!');
									return false;
								}
							}//success  end
						});
					});
				});
				
			}
		},complete: function(response) {
				if(response.status == 200) {
						//alert('有效');
					return false;
				} else {
					alert('请先连接家里的WiFi,再执行激活!');
					return false;
				}
			}
		});
	return false;
	
}







//当来到切换主板页面opr_board.html#swt_board时触发事件
$(document).on("pageinit","#swt_board",function(){
	/*
		①首先判断local['board_count'] 主板个数
		②判断当前选中的主板 local['crt_board_id']
	*/
	var board_count = parseInt(localStorage.getItem('board_count'));
	if(board_count == 0){
		window.location.href = "opr_board.html#first_scan";
		return false;
	}else{
		//有多个主板，可用于切换,到数据库中查询
		db.transaction(function(tx){
			tx.executeSql("SELECT * FROM mainboards ORDER BY time desc", [] ,function(tx, rs){
				var len = rs.rows.length;
				var mb_list = "";
				var crt_board_id = parseInt(localStorage.getItem('crt_board_id'));
				var not_crt_mb_count = 1;
				//$("#not_crt_mb_select").find("option").remove();//
				for(var i = 0; i < len; i++){
					//将插座一个个的添加到页面中
					if(crt_board_id == rs.rows.item(i).id){
						var mb_list = "<p>"+rs.rows.item(i).title+"</p>";
						$(mb_list).appendTo($("#crt_mb_list"));
					}else{
						not_crt_mb_count = 0;
						var mb_list = "<option value='"+rs.rows.item(i).id+"'>"+rs.rows.item(i).title+"</option>";
						$(mb_list).appendTo($("#not_crt_mb_select"));
					}
				}
				if(not_crt_mb_count == 1){
					$("<p>暂无其他主板<br/><a href='index.html' data-role='button' class='ui-link ui-btn ui-shadow ui-corner-all' role='button'>添加主板</a></p>").appendTo($("#not_crt_mb_list"));
				}else{
					$("#not_crt_mb_p").slideDown();
				}
			});
		});
	}
});
/*
	切换主板时，下拉菜单的change()
*/
function select_change_board(obj){
	var user_select_mb_id = obj.value;//选中的值
	if(user_select_mb_id == "88888"){
		return false;
	}
	localStorage.setItem('crt_board_id', user_select_mb_id);
	window.location.href = "opr_board.html";//跳转到主页
	return false;
}


/*清除缓存*/
function deleteData(){
	db.transaction(function(tx){
		tx.executeSql('drop table mainboards', [] ,function(tx, rs){
			alert('成功删除表mainboards');
		});
		tx.executeSql('drop table sockets', [] ,function(tx, rs){
			alert('成功删除表sockets');
		});
	});
	localStorage.setItem('board_count', 0);
	localStorage.setItem('crt_board_id', 0);
	localStorage.setItem('socket_max_id', 0);
	localStorage.setItem('mb_max_id', 0);
	window.location.href = "opr_board.html#first_scan";
}