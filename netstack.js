/*!
 * netStack v1.0.7
 * A simple and easy jQuery plugin for highlighting .NET stack traces
 * License : Apache 2
 * Author : Stanescu Eduard-Dan (https://elmah.io)
 */
(function($) {
    'use strict';

    $.fn.netStack = function(options) {

    	function search(nameKey, myArray){
		    for (var i=0; i < myArray.length; i++) {
		        if (myArray[i].at === nameKey) {
		            return myArray[i];
		        }
		    }
		}

        var settings = $.extend({

            // Default values for classes
            frame: 'st-frame',
            type: 'st-type',
            method: 'st-method',
            paramsList: 'st-frame-params',
            paramType: 'st-param-type',
            paramName: 'st-param-name',
            file: 'st-file',
            line: 'st-line'

        }, options);

        var languages = [
        	{ name: 'english', at: 'at', in: 'in', line: 'line' },
        	{ name: 'danish', at: 'ved', in: 'i', line: 'linje' }
        ];

        return this.each(function() {

            // Transform text to html
            $(this).html($(this).text());

            var stacktrace = $(this).text(),
                lines = stacktrace.split('\n'),
                clone = '';

            // detect language
            var firstLine = lines[1],
            	regLang = new RegExp('([\\w]+)'),
            	firstWord = regLang.exec(firstLine)[0],
            	selectedLanguage = search(firstWord, languages);

            for (var i = 0, j = lines.length; i < j; ++i) {

                var li = lines[i],
                	hli = new RegExp('\\b'+selectedLanguage['at']+'.*\\)');

                // Ignore first line from highlighting & comments lines
                if (hli.test(lines[i]) && (i !== 0)) {

                    // Frame
                    var regFrame = new RegExp('\\b'+selectedLanguage['at']+'.*\\)'),
                        partsFrame = String(regFrame.exec(lines[i]));
                    partsFrame = partsFrame.replace(selectedLanguage['at']+' ', '');

                    // Frame -> ParameterList
                    var regParamList = new RegExp('\\(.*\\)'),
                        partsParamList = String(regParamList.exec(lines[i]));

                    // Frame -> Params
                    var partsParams = partsParamList.replace('(', '').replace(')', ''),
                        arrParams = partsParams.split(', '),
                        stringParam = '';

                    for (var x = 0, y = arrParams.length; x < y; ++x) {
                        var theParam = '',
                            param = arrParams[x].split(' '),
                            paramType = param[0],
                            paramName = param[1];

                        if (param[0] !== "null" && param[0] !== '') {
                            theParam = '<span class="' + settings.paramType + '">' + paramType + '</span>' + ' ' + '<span class="' + settings.paramName + '">' + paramName + '</span>';
                            stringParam += String(theParam) + ', ';
                        }
                    }

                    stringParam = stringParam.replace(/,\s*$/, "");
                    stringParam = '<span class="' + settings.paramsList + '">' + '(' + stringParam + ')' + '</span>';

                    // Frame -> Type & Method
                    var partsTypeMethod = partsFrame.replace(partsParamList, ''),
                        arrTypeMethod = partsTypeMethod.split('.'),
                        method = arrTypeMethod.pop(),
                        type = partsTypeMethod.replace('.' + method, ''),
                        stringTypeMethod = '<span class="' + settings.type + '">' + type + '</span>.' + '<span class="' + settings.method + '">' + method + '</span>';

                    // Construct Frame
                    var newPartsFrame = partsFrame.replace(partsParamList, stringParam).replace(partsTypeMethod, stringTypeMethod);

                    // Line
                    var regLine = new RegExp('\\b:'+selectedLanguage['line']+'.*'),
                        partsLine = String(regLine.exec(lines[i]));
                    partsLine = partsLine.replace(':', '');

                    // File
                    var regFile = new RegExp('\\b'+selectedLanguage['in']+'.*$'),
                        partsFile = String(regFile.exec(lines[i]));
                    partsFile = partsFile.replace(selectedLanguage['in']+' ', '').replace(':' + partsLine, '');

                    li = li.replace(partsFrame, '<span class="' + settings.frame + '">' + newPartsFrame + '</span>')
                        .replace(partsFile, '<span class="' + settings.file + '">' + partsFile + '</span>')
                        .replace(partsLine, '<span class="' + settings.line + '">' + partsLine + '</span>');

                }

                if (lines.length - 1 == i) {
                    clone += li;
                } else {
                    clone += li + '\n';
                }
            }

            return $(this).html(clone);

        });

    };

}(jQuery));