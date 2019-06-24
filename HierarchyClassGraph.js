window.addEventListener('load',InitAll);

function InitAll()
{
    $(document).ready(function(){
        // var classLinks = [];
        // var methodLinks = new Array();
        // var classMethodLinks = [];
        var links = [];
        var sizeValue = 3900;

        function pack() {
            var _chart = {};

            var _width = 1280, _height = 1024,
                _svg,
                _r = 1024,  // 720
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
                console.log(_nodes);
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
                // var nodes = pack.nodes(newNodesInfo);
                console.log(nodes);

                renderCircles(nodes);

                renderLabels(nodes);

                dealLinkData(nodes);

                renderLinks(links);

                // dbClickOnCircle(_nodes, newNodesInfo);

            }

            function renderCircles(nodes) {
                _bodyG.selectAll("circle").remove();

                var circles = _bodyG.selectAll("circle")
                    .data(nodes);

                circles.enter().append("svg:circle");

                circles.transition()
                    .attr("id", function(d){
                        return d.name;
                    })
                    .attr("class", function (d, i) {
                        // console.log(i);
                        if(i == 0)
                        {
                            return "root";
                        }
                        return d.children ? "parent" : "child hidden";
                    })
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {return d.y;})
                    .attr("r", function (d) {
                        if(!d.children)
                        {
                            return d.r * 0.65;
                        }
                        return d.r * 0.95;
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
                        if(i == 0)
                        {
                            return "root";
                        }
                        return d.children? "parent" : "child hidden";
                    })
                    .attr("x", function (d) {return d.x;})
                    .attr("y", function (d) {return d.y;})
                    .text(function (d)
                    {
                        var name = d.name;
                        //处理方法名的展示
                        var _array1 = name.split(':');
                        if(_array1.length>1)
                        {
                            return _array1[_array1.length-1];
                        }
                        var _array2 = name.split(".");
                        return _array2[_array2.length-1];
                    })
                    .style("opacity", function (d) {
                        return d.r > 5 ? 1 : 0;
                    });

                labels.exit().remove();
            }

            function dealLinkData(nodes) {
                // 为svg增加 arrow marker
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
            }

            function renderLinks(links) {
                _bodyG.selectAll("line").remove();

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

            function initDataInfo(originalNodesInfo) {
                var nodesInfo = {};
                console.log(originalNodesInfo);
                for(var key in originalNodesInfo)
                {
                    if(key != "children") {
                        nodesInfo[key] = originalNodesInfo[key];
                    }
                    else
                    {
                        nodesInfo["children"] = [];
                        for(let i=0;i<originalNodesInfo["children"].length;i++)
                        {
                            var child = originalNodesInfo["children"][i];
                            var newChild = {};
                            for(var _key in child)
                            {
                                if(_key!="children")
                                {
                                    newChild[_key]=child[_key];
                                }
                            }
                            // newChild["children"] = [];
                            newChild["size"] = sizeValue;
                            nodesInfo["children"].push(newChild);
                        }
                    }
                }
                console.log(nodesInfo);
                return nodesInfo;
            }

            function dbClickOnCircle(originalNodesInfo, currentNodesInfo) {
                var circles = _bodyG.selectAll("circle");
                circles.on("dblclick", function(d){
                    // console.log(this.getAttribute("id"));
                    // update data and the show
                    currentNodesInfo = updateData(originalNodesInfo, currentNodesInfo, this.getAttribute("id"));
                    renderBody(_svg);
                    return false;
                })
            }

            function updateData(originalNodesInfo, currentNodesInfo, dealingNodeName) {
                var classes1 = originalNodesInfo["children"];
                var classes2 = currentNodesInfo["children"];
                var newNodesInfo = {};
                for(var i=0;i<classes1.length;i++)
                {
                    // console.log(classes1[])
                    if(classes1[i].name == dealingNodeName) {
                        console.log("find");
                        if (classes2[i].size) {
                            delete classes2[i].size;
                            classes2[i].children = classes1[i].children;
                        }
                        else {
                            classes2[i].size = sizeValue;
                            delete classes2[i].children;
                        }
                        break;
                    }
                }
                currentNodesInfo["children"] = classes2;
                // console.log(classes1);
                // console.log(classes2);
                console.log(currentNodesInfo);
                return currentNodesInfo;
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
                "name":"package",
                "children":[],
                "links":[]
            };
            // 处理类及其包含的方法的数据
            for(var classKey in classMethodMap)
            {
                nodes.children.push({"name":classKey,"children":[]});
                for(let i=0;i<classMethodMap[classKey].length;i++)
                {
                    nodes.children[nodes.children.length-1].children.push({"name":classKey + ":"+classMethodMap[classKey][i],"size":sizeValue});
                }
            }
            // 处理links数据
            for(let i=0;i<linksInfo.length;i++)
            {
                nodes.links.push({"source":linksInfo[i].source.name,"target":linksInfo[i].target.name});
            }

            chart.nodes(nodes).render();

        });
    });
}