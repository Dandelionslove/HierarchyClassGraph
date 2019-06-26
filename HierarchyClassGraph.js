window.addEventListener('load',InitAll);

function InitAll()
{
    $(document).ready(function(){
        // var classLinks = [];
        // var methodLinks = new Array();
        // var classMethodLinks = [];
        // var links = [];
        var sizeValue = 3900;
        var packageColor = "#feee7d";
        var classColor = "#99f19e";
        var methodColor = "#9055a2";


        function pack() {
            var _chart = {};

            var _width = 1024, _height = 1024,  //1280
                _svg,
                _r = 800,  // 720
                _x = d3.scale.linear().range([0, _r]),
                _y = d3.scale.linear().range([0, _r]),
                _nodes,   // original nodes info
                _bodyG;

            // var newNodesInfo;  // a variable records the newest nodes info.

            _chart.render = function () {
                if (!_svg) {
                    _svg = d3.select("body").append("svg")
                        .attr("height", _height)
                        .attr("width", _width);
                }
                // console.log(_nodes);
                // newNodesInfo = initDataInfo(_nodes);
                renderBody(_svg);
            };

            function renderBody(svg) {
                if (!_bodyG) {
                    _bodyG = svg.append("g")
                        .attr("class", "body")
                        .attr("transform", function (d) {
                            return "translate(" + (_width - _r) / 2 + "," + (_height - _r) / 2 + ")";
                        });
                }

                var pack = d3.layout.pack()
                    .size([_r, _r])
                    .value(function (d) {
                        return d.size;
                    });

                // newNodesInfo = initDataInfo(_nodes);

                var nodes = pack.nodes(_nodes);
                // console.log(nodes);

                renderCircles(nodes);

                renderLabels(nodes);

                // dealLinkData(nodes);

                // renderLinks(nodes);

                bindEventsOnCircles();
            }

            function renderCircles(nodes) {
                _bodyG.selectAll("circle").remove();

                var circles = _bodyG.selectAll("circle")
                    .data(nodes);

                circles.enter().append("svg:circle");

                circles.transition()
                    .attr("id", function(d){
                        if(d.type == "method")   //有的id重复了
                        {
                            return d.type+":"+d.parent.name+":"+d.name.split(":").splice(-1,1);
                        }
                        return d.type+":"+d.name;
                    })
                    .attr("class", function (d, i) {
                        var classList = d.type;   // rootElement, package, class, method;
                        if(d.type == "method")
                        {
                            classList = classList + " hidden";
                        }
                        return classList;
                    })
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {return d.y;})
                    .attr("r", function (d) {

                        // if(!d.children)
                        // {
                        //     return d.r * 0.65;
                        // }
                        // return d.r * 0.95;
                        if(d.type == "package" && d.children)
                        {
                            for(let j=0;j<d.children.length;j++)
                            {
                                // console.log(d.children[j]);
                                if(d.children[j].type == "class")
                                {
                                    return d.r;
                                }
                            }
                            return d.r+(60-d.depth*10);
                        }
                        if(d.type == "class" && d.parent)
                        {
                            if(d.r == d.parent.r)
                            {
                                return d.r - 4;
                            }
                        }
                        if(d.type == "method")
                        {
                            if(d.parent.children.length == 1)
                            {
                                return d.r*0.5;
                            }
                            return d.r*0.65;
                        }
                        return d.r;
                    })
                    .style("fill", function(d){
                        // return fillColor[d.depth%fillColor.length];
                        if(d.type == "package")
                        {
                            return packageColor;
                        }
                        if(d.type == "class")
                        {
                            return classColor;
                        }
                        if(d.type == "method")
                        {
                            return methodColor;
                        }
                    })
                    // .style("stroke", function(d){
                    //     // return fillColor[d.depth%fillColor.length];
                    //     return "#333";
                    // })
                    .style("opacity", function(d){
                        if(d.type == "method")
                        {
                            return .7;
                        }
                        return 1;
                    });

                circles.exit().transition()
                    .attr("r", 0)
                    .remove();
            }

            function renderLabels(nodes) {
                _bodyG.selectAll("text").remove();

                var labels = _bodyG.selectAll("text")
                    .data(nodes);

                labels.enter().append("svg:text")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")  // start, middle, end
                    .style("opacity", 0);

                labels.transition()
                    .attr("class", function (d, i) {
                        var classList = d.type;   // rootElement, package, class, method;
                        if(d.type == "method")
                        {
                            classList = classList + " hidden";
                        }
                        return classList;
                    })
                    .attr("x", function (d) {return d.x;})
                    .attr("y", function (d) {
                        if(d.type == "package" && d.children)
                        {
                            for(let j=0;j<d.children.length;j++)
                            {
                                if(d.children[j].type == "class")
                                {
                                    return d.y-d.r+4;
                                }
                            }
                            return d.y-d.r-(60-d.depth*12);
                        }
                        return d.y;
                    })
                    .text(function (d)
                    {
                        var name = d.name;
                        //处理方法名的展示
                        if(d.type == "method") //方法名才包括了包名、类名、方法名和：
                        {
                            var array = name.split(":");
                            return array[array.length-1];
                        }
                        //处理类名的展示
                        if(d.type == "class") // 类名包括了包名和类名
                        {
                            var array = name.split(".");
                            return array[array.length-1];
                        }
                        return name;
                    })
                    .style("opacity", function (d) {
                        return d.r > 5 ? 1 : 0;
                    });

                labels.exit().remove();
            }

            function renderLinks(nodes) {
                _bodyG.selectAll("line").remove();

                var links = dealLinkData(nodes);

                var lines = _bodyG.selectAll("line").data(links);
                lines.enter().append("svg:line")
                    .attr("x1",function(d){return d.x1;})
                    .attr("y1",function(d){return d.y1;})
                    .attr("x2",function(d){return d.x2;})
                    .attr("y2",function(d){return d.y2;})
                    .attr("stroke", "green")
                    .attr("stroke-width",2)
                    .attr("opacity",1)
                    .attr("marker-end","url(#arrow)");
            }

            function dealLinkData(nodes) {
                // 为svg增加 arrow marker
                console.log(nodes);
                var links = [];
                var linkInfo = nodes[0].links;
                linkInfo.forEach(function(currentLink){
                    links.push({"x1":0,"y1":0,"x2":0,"y2":0});
                    let sourceExist = false;
                    let targetExist = false;
                    for(let i=1;i<nodes.length;i++)
                    {
                        if(currentLink.source == nodes[i].name)
                        {
                            links[links.length-1].x1=nodes[i].x;
                            links[links.length-1].y1=nodes[i].y;
                            sourceExist = true;
                            continue;
                        }
                        if(currentLink.target == nodes[i].name)
                        {
                            links[links.length-1].x2=nodes[i].x;
                            links[links.length-1].y2=nodes[i].y;
                            targetExist = true;
                            continue;
                        }
                    }
                    if(!sourceExist || !targetExist)
                    {
                        links.pop();
                    }
                });

                //初始化箭头描述信息
                var defs = d3.select('svg').append('defs');
                //箭头
                var arrowMarker = defs.append('marker')
                    .attr('id','arrow')
                    .attr('markerUnits', 'strokeWidth')
                    .attr('markerWidth', 12)
                    .attr('markerHeight', 12)
                    .attr('viewBox', "0 0 12 12")
                    .attr('refX', 6)
                    .attr('refY', 6)
                    .attr('orient', 'auto');
                var arrowPath = "M2,2 L10,6 L2,10 L6,6 L2,2";
                // var arrowPath = "M20,70 T80,100 T160,80 T200,90";
                arrowMarker.append("path").attr("d", arrowPath).attr('fill','#937').attr("opacity",0.9);

                console.log(links);
                return links;
            }

            // 为circles绑定事件
            function bindEventsOnCircles() {
                var circles = _bodyG.selectAll("circle");
                var labels = _bodyG.selectAll("text")[0];

                //双击circle的时候，class circle会展示method circle，method circle会展示方法流程图
                circles.on("dblclick", function(d,i){
                    if(d.type == "class" && d.children)  //控制该class下的method的显示与否，通过classList来控制
                    {
                        // 寻找class下的method：通过类名
                        var circleElements = circles[0];
                        var className = d.name;
                        for(let k=0;k<circleElements.length;k++)
                        {
                            let circleIdInfo = circleElements[k].getAttribute("id").split(":");
                            let cirCleType = circleIdInfo[0];
                            if(cirCleType == "method" && circleIdInfo.length>2 &&circleIdInfo[1] == className)
                            {
                                if(circleElements[k].classList.contains("hidden"))
                                {
                                    circleElements[k].classList.remove("hidden");
                                    labels[k].classList.remove("hidden");
                                    labels[i].setAttribute("y",d.y-d.r+10);
                                }
                                else
                                {
                                    circleElements[k].classList.add("hidden");
                                    labels[k].classList.add("hidden");
                                    labels[i].setAttribute("y",d.y);
                                }
                            }
                        }
                    }
                    return false;
                });

                // 鼠标悬浮在circle上的时候，label放大, circle和label的index是对应起来的
                circles.on("mouseenter", function(d,i){
                   // 相应的label变大
                    if(!labels[i].classList.contains("focus"))
                    {
                        labels[i].classList.add("focus");
                    }

                });

                // 鼠标移出circle的时候，label复原
                circles.on("mouseout", function(d, i){
                    if(labels[i].classList.contains("focus"))
                    {
                        labels[i].classList.remove("focus");
                    }
                });
            }

            _chart.width = function (w) {
                if (!arguments.length) return _width;
                _width = w;
                return _chart;
            };

            _chart.height = function (h) {
                if (!arguments.length) return _height;
                _height = h;
                return _chart;
            };

            _chart.r = function (r) {
                if (!arguments.length) return _r;
                _r = r;
                return _chart;
            };

            _chart.nodes = function (n) {
                if (!arguments.length) return _nodes;
                _nodes = n;
                return _chart;
            };

            return _chart;
        }
        var chart = pack();
        // var nodes;
        // $.getJSON('data1.txt', function(nodes)
        // {
        //     // console.log(nodes);
        //     chart.nodes(nodes).render();
        // });
        $.getJSON('data2.txt', function(data)
        {
            // console.log(data);
            var nodesInfo = data.nodes;
            var linksInfo = data.links;
            var classesInfo = data.classes;
            var classMethodMap = data.classMethodMap;
            var nodes = {
                "name":"rootElement",
                "type":"rootElement",
                "children":[],
                "links":[]
            };
            //处理包结构
            // console.log(classesInfo);
            var packageInfo = new Array();  //记录了所有的包+其中包含的类结构
            var curCA = nodes.children;
            for(let i=0;i<classesInfo.length;i++)
            {
                // packageInfo.push(new Array());
                var packageStructure = classesInfo[i].split("."); //最后一个元素不是package，是class名，所以这里不考虑
                // packageInfo.push(packageStructure.slice(0, packageStructure.length-1));
                packageInfo.push(packageStructure);
            }
            // console.log(packageInfo);
            for(let i=0;i<packageInfo.length;i++)  //对每个类的包结构进行分析
            {
                curCA = nodes.children;  // curCA: current Children Array
                // console.log(packageInfo[i]);
                //在当前层次的children中寻找是否有对应的package名，若有，继续分析packageInfo的下一组，若无，则在相应位置加入children信息
                for(let j=0;j<packageInfo[i].length;j++)
                {
                    let isPackageFound = false;
                    for(let k=0;k<curCA.length;k++)
                    {
                        if(curCA[k].name == packageInfo[i][j]) // 找到
                        {
                            curCA = curCA[k].children;
                            isPackageFound = true;
                            break;
                        }
                    }
                    if(!isPackageFound)
                    {
                        curCA.push({
                            "name":(j<packageInfo[i].length-1?packageInfo[i][j]:packageInfo[i].join(".")),
                            "children":[],
                            "type":(j<packageInfo[i].length-1?"package":"class")
                        });
                        curCA = curCA[curCA.length-1].children;
                    }
                }
                // console.log(curCA);
                //将方法加入数据结构中
                //注：类名和方法名都包含了包的名
                let curClassName = packageInfo[i].join(".");
                for(var classKey in classMethodMap)
                {
                    if(classKey == curClassName)
                    {
                        for(let i=0;i<classMethodMap[classKey].length;i++) {
                            curCA.push({
                                "name": classKey+":"+classMethodMap[classKey][i],
                                // "name":classMethodMap[classKey][i],
                                "type":"method",
                                "size":sizeValue
                            })
                        }
                    }
                }
            }
            // 处理links数据
            for(let i=0;i<linksInfo.length;i++)
            {
                nodes.links.push({"source":linksInfo[i].source.name,"target":linksInfo[i].target.name});
            }

            // console.log(nodes);

            chart.nodes(nodes).render();

        });
    });
}