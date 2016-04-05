
(function(){
    "use strict";

    var cache={}; 

    var T = {
        htmlEncode : function(s){
            return s
                .split('&').join('&amp;')
                .split('>').join('&gt;')
                .split('<').join('&lt;')
                .split('"').join('&quot;')
                .split("'").join('&#39;');
        },

        setChar : function(c, str){
            var a='mTpl_' + c + '_mTpl', 
                f=function(s){ 
                    if(str.indexOf(s) >-1){
                        return f(s+a);
                    }
                    return s;
                };
            return f(a);
        },

        recoverChar : function(s, r, n, isKeepRN, isKeepCommentRN, htmlCommentCode, commentObj){
            s = !isKeepRN ? s : s
                    .replace(new RegExp(r,'g'),'\r')
                    .replace(new RegExp(n,'g'),'\n');
            s = htmlCommentCode !=1 ? s : s
                    .replace(/mTpl_comment\d+;/g, function(l){
                        var i=l.slice(12, l.length-1);
                        return commentObj[i];
                    });

            s = htmlCommentCode !=1 || !isKeepCommentRN ? s : s
                    .replace(/<!--(?:(?!-->)[^])*-->/g, function(l){
                        return l
                            .replace(new RegExp(r,'g'),'\r')
                            .replace(new RegExp(n,'g'),'\n');
                    });

            return s;
        },

        encodeChar : function(s){
            return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1')
        },

        getReg_rangeOutChar : function (l, r, c){
            r = this.encodeChar(r);
            return new RegExp(l+'(?:(?!'+ r +')[\\s\\S])*'+ r +'|('+ c +'+)', 'g'); 
        }, 

        formatTpl : function(tpl, r, n, startSelector, endSelector, htmlCommentCode, commentObj, isKeepRN, isEncode, isError){
            var a = startSelector, b = endSelector;
            if( !(tpl && a && b) ) {return ''} 
            if(!(tpl.indexOf(a) > -1 && tpl.indexOf(b) > -1)){return tpl}

            var lineBr  = isError? '\n' : '', 
                left    = this.setChar('L', tpl), 
                reg     = T.getReg_rangeOutChar(left, b, "'");

            tpl = isError || !isKeepRN ? tpl.replace(/[\r\n]/g, ' ') : tpl
                    .replace(/\r/g, r) 
                    .replace(/\n/g, n);

            tpl = htmlCommentCode==0 ? tpl : 
                    htmlCommentCode==2 ? tpl.replace(/<!--(?:(?!-->)[^])*-->/g, '') : tpl
                        .replace(/<!--(?:(?!-->)[^])*-->/g, function(l){
                            var i=commentObj.length++;
                            commentObj[i]=l;
                            return 'mTpl_comment'+i+';';
                        });

            return tpl 
                .split('\\').join('\\\\')
                .split(a).join(left)
                .replace(reg, function(l,$1){return $1 ? new Array($1.length + 1).join('\r') : l})
                .replace(new RegExp(left+'=(.*?)'+b,'g'), "';"+lineBr+" s+=" + (isEncode ? "mTpl_htmlEncode(String($1))" : "String($1)") + ";"+lineBr+" s+='")
                .split(left).join("';"+lineBr) 
                .split(b).join(lineBr+' s+=\'')
                .split('\r').join('\\\'');
        },

        compileFn : function(args, strFormatTpl, isEncode){
            return new Function(args, 
                    (isEncode ? "var mTpl_htmlEncode="+ this.htmlEncode.toString() + ';\n ' : '')+
                    "var s='';\n s+='" + strFormatTpl + "';\n return s");
        }
    };

    function mTpl(opt){
        var str             = opt.text,
            data            = opt.data,
            startSelector   = opt.startSelector || '<' + '%',
            endSelector     = opt.endSelector || '%' + '>', 
            isCache         = opt.isCache != undefined ? opt.isCache : true, 

            scope           = opt.scope || this, 
            isEncode        = opt.isEncode || false,
            isKeepRN        = opt.isKeepRN || false, 
            isKeepCommentRN = opt.isKeepCommentRN || true,
            htmlCommentCode = opt.htmlCommentCode != undefined ? opt.htmlCommentCode : 1, 

            tpl         = document.getElementById(str) ? document.getElementById(str).innerHTML : str,
            valueArr    = [], 
            commentObj  = { length : 0 }, 
            fn          = null,
            r           = T.setChar('R', tpl),
            n           = T.setChar('N', tpl);

        if(isCache && cache[str]){
            for (var i=0, list=cache[str].propList, len=list.length; i<len; i++){
                valueArr.push(data[list[i]]);
            }
            fn=cache[str].parsefn;
        }else{
            var p, propArr = [];
            for (p in data){ 
                propArr.push(p);
                valueArr.push(data[p]);
            }

            fn = T.compileFn(
                propArr, 
                T.formatTpl(tpl, r, n, startSelector, endSelector, htmlCommentCode, commentObj, isKeepRN, isEncode), 
                isEncode
            );

            isCache && (cache[str] = {parsefn : fn, propList : propArr});
        }

        var s;

        try{
            s = fn.apply(scope, valueArr);
        }catch(e){
            fn = T.compileFn(
                propArr, 
                T.formatTpl(tpl, r, n, startSelector, endSelector, htmlCommentCode, commentObj, isKeepRN, isEncode, true), 
                isEncode
            );

            s = fn.apply(scope, valueArr);
        }

        return T.recoverChar(s, r, n, isKeepRN, isKeepCommentRN, htmlCommentCode, commentObj);
    } 
    
    typeof exports != 'undefined' ? exports.mTpl = mTpl : window.mTpl = mTpl;
})();

