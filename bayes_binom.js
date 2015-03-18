function getSamples(a,b,x,y) {
    vals = [];
    var samples = 5000;
    for	(index = 0; index < samples; index++) {
        vals.push(jStat.beta.sample(1+a, 1+b)-jStat.beta.sample(1+x, 1+y));
    }
    return vals;
};


function bayes_binom(p1, p2) {
    var i = p1.map(Number).reduce(function(a, b) {return a + b;});
    var j = p2.map(Number).reduce(function(a, b) {return a + b;});
    
    var samples = getSamples(i, p1.length - i, j, p2.length - j);
    samples.sort();
    var lower = d3.quantile(samples, 0.0275);
    var upper = d3.quantile(samples, 0.975);
    
    var kde = science.stats.kde().sample(samples);
    var dataPoints = kde(d3.range(-1,1,0.01));
    var yVals = dataPoints.map(function(d) { return d[1] }).reduce(function(prev, cur, i, arr) { return prev + cur }, 0);
    
    //setup the regret chart
    var margin = {top: 20, right: 20, bottom: 30, left: 25},
    width = 400 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width])
        .domain([-1,1]);

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, 5]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickValues([])
        .orient("left");

    //create the svg space on the page
    var svg = d3.select("#posterior").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
    //draw the x and y axes
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
    
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height-6)
    .text("Difference");

    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Density");
    
    //plot the data
    var line = d3.svg.line()
      .x(function(d) { return x(d[0]); })
      .y(function(d) { return y(d[1]); });
    
    svg.append("path")
          .datum(dataPoints)
          .attr("class", "blueline")
          .attr("d", line); 
    
    var text = svg.append("svg:text")
    .attr("x", 120)
    .attr("y", 50)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .style("font", "300 14px Helvetica Neue")
    .text("95% credible interval: "+ lower.toFixed(2) + " to " + upper.toFixed(2));
    
    //svg.append("path")
    //      .datum([[lower,0],[lower,1],[lower,2],[lower,3],[lower,4],[lower,5]])
    //      .attr("class", "blackline")
    //      .attr("d", line); 
    
    //svg.append("path")
    //      .datum([[upper,0],[upper,1],[upper,2],[upper,3],[upper,4],[upper,5]])
    //      .attr("class", "blackline")
    //      .attr("d", line); 
    
};

function main() {
    //remove a previous simulation, if it exists
    d3.selectAll("svg").remove();
    var p1 = $('textarea#process1').val().split(",");
    var p2 = $('textarea#process2').val().split(",");
    bayes_binom(p1,p2);
};