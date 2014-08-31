

    极速微模板解析引擎mTpl v1.0: beta版


    简介：
        mTpl是一个JavaScript的微小却强大的微模板解析引擎。
        速度领先，代码简短，使用非常简单，兼容性好，可以输出各种字符，支持调试，注释，作用域，xss过滤，原格式输出等。
    
    特点：
        1、较高的运行效率
        2、强大兼容性
        3、无任何限制的语法支持(if/for/wihle/...)
        4、微体积
        5、作用域设定
        6、调试功能
        7、xss过滤
        8、注释功能
        9、输出源码书写格式功能
        
    极速微模板解析引擎mTpl，您值得拥有！

    mTpl({      
        str                 : str,          //模板id || 模板text
        data                : {},           //数据源json 
        startSelector       : '<' + '%',    //开始选择符 
        endSelector         : '%' + '>',    //结束选择符
        isCache             : true,         //是否缓存模板
        
        scope               : window,       //作用域
        isEncode            : false,        //布尔值或函数                                 
        isKeepRN            : false,        //是否保留源码中的回车换行符(不含注释部分)
        isKeepCommentRN     : true,         //是否保留注释中的回车换行符
        htmlCommentCode     : 1             //是否支持html注释, 共三个值: 0不支持 1支持并输出 2支持但不输出
    })
    
    注意：
        当isKeepRN==true时，模板里的单条语句不支持分行书写(注释部分不受此约束)，如以下书写方式都会报错
                <%
                    var a=1;
                %>
            或
                <% var 
                    a=1;
                %>          
        isKeepRN==false时不受此限制。
        
        这块是个缺点，正在努力完善中~~

 
