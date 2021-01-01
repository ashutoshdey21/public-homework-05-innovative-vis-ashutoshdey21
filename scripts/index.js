var dogsDb = {}, flightsDb = [], yearList = [], rocketsByYear = new Map(), dataSet = [];
var rocketSize = 150;
var padding = 20;
const lineMargin = {top: 400, right: 60, bottom: 60, left: 100};


document.addEventListener('DOMContentLoaded', function () {

    Promise.all([d3.csv('data/Dogs-Database.csv'),
        d3.csv('data/Flights-Database.csv')]).then(value => {

        value[0].forEach(function (value) {
            if (value && value.Name && value.Fate) {

                dogsDb[value.Name] = value.Fate.split(" ")[0];
            }
        });

        value[1].forEach(function (value) {

            if (value && value.Date && value.Rocket && value.Dogs) {
                let year = value.Date.split("-");
                let each = {
                    year: +year[0],
                    rocket: value.Rocket,
                    dogs: value.Dogs.split(","),
                    date: value.Date

                }
                if (!yearList.includes(year[0])) {
                    yearList.push(year[0])
                }
                flightsDb.push(each);
            }
        });
        yearList.sort(function (a, b) {
            return (b - a);
        });

    }).then(() => {
            rocketsByYear = d3.group(flightsDb, d => d.year);
            flightsDb.sort(function (a, b) {
                console.log(a.date + " " + b.date);
                return (new Date(b.date) - new Date(b.date));
            });
        }
    ).then(() => {

        /*for (let i in yearList) {
            dataSet.push([yearList[i], rocketsByYear.get(yearList[i])]);

        }*/

        drawSpaceVisualization();
    });


});

function drawSpaceVisualization() {

    console.log(flightsDb);
    console.log(rocketsByYear)
    console.log(dogsDb);

    let yScale = d3.scaleLinear()
        .domain([d3.min(yearList), d3.max(yearList)])
        .range([yearList.length * rocketSize * 1.25, 10]);


    d3.select('.years')
        .selectAll('.year')
        .data(yearList)
        .enter()
        .append('h1')
        .classed('year', true)
        .style('margin', 0)
        .style('position', 'absolute')
        .style('width', rocketSize + 'px')
        .style('top', function (d, i) {
            return lineMargin.top + yScale(d) + 'px';
        })

        .text(function (d) {
            return d
        })
        .style("color", "#F8F8F8")


    let body_svg = d3.select('body').select('svg')
        .style('margin', 0)
        .style('position', 'absolute')
        .style('left', rocketSize + 'px')
        .style('width', rocketSize * 12 + 'px')
        .style('top', function (d, i) {
            return lineMargin.top + (i * rocketSize * 1.5) + 'px';
        })
        .style('height', yearList.length * rocketSize * 1.5 + 'px')


    var minDogs = 1;
    var maxDogs = 2;
    var rocketSizeScale = d3.scaleLinear()
        .range([.05, .5]);
    rocketSizeScale.domain([minDogs, maxDogs]);

    let tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip-data")
        .style("position", "absolute")
        .style("background-color", "pink")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("opacity", "0");

    let mousemove = function (d) {
        tooltip
            .html("Dog:" + d)
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .style("padding", "10px")
            .style("left", (d3.event.pageX + 50) + "px")
            .style("top", (d3.event.pageY - 50) + "px");
    }

    let mousemove_date = function (d) {
        tooltip
            .html("Flew on: " + d)
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .style("padding", "10px")
            .style("left", (d3.event.pageX + 50) + "px")
            .style("top", (d3.event.pageY - 50) + "px");
    }
    let mouseover = function (d) {
        console.log(d);
        tooltip
            .style("opacity", 1)
    }
    let mouseleave = function (d) {
        tooltip
            .style("opacity", 0)
    }

    body_svg
        .selectAll('g')
        .data(flightsDb)
        .join(
            enter => {
                let g = enter.append("g")
                    .attr('transform', function (d, i) {

                        let x = (i % rocketsByYear.get(d.year).length) * rocketSize * 1.25;
                        let y = yScale(d.year);
                        return 'translate(' + [x, y] +
                            ')scale(' + 2 + ')';
                    });

                g.append("svg:image")
                    .attr("xlink:href", "images/rocket2.png")
                    .attr("width", 50)
                    .attr("height", 50)
                    .on('mouseover', (d) => {
                        mouseover(d.date);
                    })
                    .on('mousemove', (d) => {
                        mousemove_date(d.date);
                    })
                    .on('mouseleave', (d) => {
                        mouseleave(d.date);
                    });

                g.append("svg:image")
                    .attr("xlink:href", function (d, i) {
                        // console.log(d.dogs);
                        return dogsDb[d.dogs[0]] === 'Survived' ? "images/paw-alive.svg" : "images/paw-dead.svg"
                    })
                    .attr('transform', (d, i) => `translate(${0},${2})`)
                    .attr("width", 10)
                    .attr("height", 10)
                    .on('mouseover', (d) => {
                        mouseover(d.dogs[0]);
                    })
                    .on('mousemove', (d) => {
                        mousemove(d.dogs[0]);
                    })
                    .on('mouseleave', (d) => {
                        mouseleave(d.dogs[0]);
                    });


                g.append('text')
                    .text(function (d, i) {
                        return d.date + " " + d.dogs
                    })
                    .attr('display', 'none');

                g.append('text')
                    .text(function (d, i) {
                        return d.rocket
                    })
                    .style("fill", "white")
                    .attr('font-size', '5')
                    .attr('transform', (d, i) => `translate(${12},${55})`);


                g.append("svg:image")
                    .attr("xlink:href", function (d, i) {
                        if (d.dogs[1] && dogsDb[d.dogs[1]] === 'Survived') {
                            return "images/paw-alive.svg";
                        } else if (d.dogs[1] && dogsDb[d.dogs[1]] === 'Died') {
                            return "images/paw-dead.svg";
                        }
                        return;

                    })
                    .attr('transform', (d, i) => `translate(${0},${20})`)
                    .attr("width", 10)
                    .attr("height", 10)
                    .on('mouseover', (d) => {
                        mouseover(d.dogs[1]);
                    })
                    .on('mousemove', (d) => {
                        mousemove(d.dogs[1]);
                    })
                    .on('mouseleave', (d) => {
                        mouseleave(d.dogs[1]);
                    });

            }
        );

}




