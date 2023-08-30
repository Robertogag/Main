// Consts
const width = 900
const height = 500
const margin = {
    top: 10,
    right: 50,
    left: 80,
    bottom: 10,
}

// SVG 
const svg = d3.select("div#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

// Groups
const elementGroup = svg.append("g").attr("class", "elementGroup")
const axisGroup = svg.append("g").attr("class", "axisGroup")

const xAxisGroup = axisGroup.append("g").attr("class", "xAxisGroup")
    .attr("transform", `translate(${margin.left}, ${height - margin.bottom - margin.top})`);
const yAxisGroup = axisGroup.append("g").attr("class", "yAxisGroup")
    .attr("transform", `translate(${margin.left}, ${0})`)

// Scales and axes
const x = d3.scaleLinear().range([0, width - margin.left - margin.right])
const y = d3.scaleBand().range([height - margin.top - margin.bottom, 0]).padding(0.1)

const xAxis = d3.axisBottom().scale(x).ticks(5)
const yAxis = d3.axisLeft().scale(y)


let years
let winners
let originalData

// Data
d3.csv("WorldCup.csv").then(data => {
    data.forEach(d => {
        d.Year = +d.Year
    });

    data = data.filter(d => d.Winner !== "")

    originalData = data
    years = data.map(d => +d.Year)
    winners = d3.nest()
        .key(d => d.Winner)
        .entries(data)

    x.domain([0, d3.max(winners.map(d => d.values.length))])
    y.domain(winners.map(d => d.key))

    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    // Update 
    slider()
    update(winners)
});

// Update 
function update(data) {
    const max = d3.max(data.map(d => d.values.length))
    const elements = elementGroup.selectAll("rect").data(data)

    // Enter
    const enteredElements = elements.enter()
        .append("rect")
        .attr("class", d => (d.values.length === max) ? "bar max" : "bar")
        .attr("height", y.bandwidth())
        .attr("x", margin.left)
        .attr("y", d => y(d.key))

    enteredElements.transition()
        .delay((d, i) => i * 50)
        .duration(300)
        .ease(d3.easeElastic)
        .attr("width", d => x(d.values.length))

    elements
        .attr("class", d => (d.values.length === max) ? "bar max" : "bar")
        .attr("height", y.bandwidth())
        .attr("x", margin.left)
        .attr("y", d => y(d.key))
        .transition()
        .duration(300)
        .attr("width", d => x(d.values.length))

    elements.exit()
        .transition()
        .duration(100)
        .attr("width", 0)
        .remove();
}

// Filter data by year
function filterDataByYear(Year) {
    let updatedData = originalData.filter(d => d.Year <= Year)
    updatedData = d3.nest()
        .key(d => d.Winner)
        .entries(updatedData)

    return updatedData
}

// Slider 
function slider() {
    const startYear = d3.min(years)
    const endYear = d3.max(years)
    const step = 4
    const sliderValues = []

    for (let year = startYear; year <= endYear; year += step) {
        sliderValues.push(year)
    }

    const sliderTime = d3
        .sliderBottom()
        .min(startYear)
        .max(endYear)
        .step(step)
        .width(800)
        .tickValues(sliderValues)
        .default(endYear)
        .on('onchange', val => {
            d3.select('p#value-time').text(val)
            const filteredData = filterDataByYear(val)
            update(filteredData)
        })

    const gTime = d3.select('div#slider-time')
        .append('svg')
        .attr('width', width * 100)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')

    gTime.call(sliderTime)
    d3.select('p#value-time').text(sliderTime.value())
}

// Title
const titleMargin = -9
svg.append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", margin.top - titleMargin)
    .attr("text-anchor", "middle")
    .text("World Cup Wins by Country")
    .attr("font-weight", "bold")
    .style("font-size", "25px")
