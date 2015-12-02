var db = null;
try {  
	if (!db) {  
		db = openDatabase('microcloud', '1.0', '微云', 100000000);  //参数1 数据库名称 参数2 数据库版本 参数3:数据库描述 参数4 建立的数据库的最大容量
		//创建表
		db.transaction(function(tx){
			tx.executeSql('create table if not exists mainboards(id integer NOT NULL PRIMARY KEY AUTOINCREMENT,number varchar(10),title varchar(50), time datetime)',[]);//创建mainboards表
			tx.executeSql('create table if not exists sockets(id integer NOT NULL PRIMARY KEY AUTOINCREMENT, mb_id integer NOT NULL,number varchar(10),title varchar(50), active char(1),time datetime)',[]);//创建插座表
		});
	}
} catch (e) {  
	alert("软件启动失败，建议您重启软件" + e);  
	db = null;  
} 