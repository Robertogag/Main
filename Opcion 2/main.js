// Constants 
const diCaprioBirthYear = 1974
const age = year => year - diCaprioBirthYear
const today = new Date().getFullYear()

const width = 1500
const height = 600
const margin = {
    top: 20,
    right: 150,
    bottom: 40, 
    left: 40,   
}

// SVG 
const svg = d3.select("div#chart").append("svg")
    .attr("width", width)
    .attr("height", height)


// Groups
const elementGroup = svg.append("g").attr("class", "elementGroup")
const axisGroup = svg.append("g").attr("class", "axis")
const xAxisGroup = axisGroup.append("g")
    .attr("class", "xAxisGroup")
    .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
const yAxisGroup = axisGroup.append("g")
    .attr("class", "yAxisGroup")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

// Scales and axes
const x = d3.scaleBand()
    .range([0, width - margin.left - margin.right])
    .padding(0.1)
const y = d3.scaleLinear()
    .range([0, height - margin.top - margin.bottom])

const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y)

// Data
d3.csv("data.csv").then(data => {
    data.forEach(d => {
        d.year = +d.year
        d.age = +d.age
        d.ageToday = age(today)
    })

    const nameGroup = d3.nest()
        .key(d => d.name)
        .entries(data)

    x.domain(data.map(d => d.year))
    y.domain([50, 15])

    const bars = createBars(nameGroup)

    bars.on("mouseover", MouseOver)
    bars.on("mouseout", MouseOut)

    const leoAgeData = data.map(d => ({
        year: d.year,
        age: age(d.year),
    }))

    LeoAgeLine(leoAgeData)

    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)
})

//Chart
function createBars(data) {
    return elementGroup.selectAll(".barGroup")
        .data(data)
        .enter().append("g")
        .attr("class", d => "barGroup barGroup-" + d.key) 
        .selectAll(".bar")
        .data(d => d.values)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => margin.left + x(d.year))
        .attr("y", d => margin.top + y(d.age))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - margin.top - y(d.age))
}

function MouseOver(d) {
    const currentName = d.name
    const ageDifference = d.year - diCaprioBirthYear - d.age

    d3.selectAll(".bar").style("opacity", barData => (barData.name === currentName) ? 1 : 0.1)
    
    svg.append("text")
        .attr("class", "tooltip")
        .attr("x", width / 2)
        .attr("y", margin.top + 30)
        .attr("text-anchor", "middle")
        .text(`${d.name} Age: ${d.age} - Di Caprio Age: ${d.year - diCaprioBirthYear} - Age Difference: ${ageDifference}`)
        .style("font-size", "30")
        .attr("font-weight", "bold")
        
}

function MouseOut() {
    svg.selectAll(".bar").style("opacity", 1)
    svg.selectAll(".tooltip").remove()
}

//LeoLine
function LeoAgeLine(data) {
    const line = d3.line()
        .x(d => margin.left + x(d.year) + x.bandwidth() / 2) 
        .y(d => margin.top + y(d.age))
        .curve(d3.curveMonotoneX)


    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 0 20 20")
        .attr("refX", 18)  
        .attr("refY", 10)  
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 20 10 L 0 20 z") 
        .attr("fill", "blue")

    elementGroup.append("text")
        .attr("class", "leoAgeLabelText")
        .attr("x", margin.left + x(data[data.length - 1].year) + x.bandwidth() / 2 + 5)
        .attr("y", margin.top + y(data[data.length - 1].age))
        .attr("dy", "1.35em")
        .text("Leo Age Line")
        .style("font-size", "25px")
        .style("fill", "blue")
        .attr("font-weight", "bold")

    elementGroup.append("path")
        .datum(data)
        .attr("class", "leoAgeLine")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)")
}




