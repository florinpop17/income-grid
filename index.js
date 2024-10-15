const millionDollarGrid = document.getElementById("million-dollar-grid");
const revenueBreakdown = document.getElementById("revenue-breakdown");

fetch("./_data.json")
    .then((response) => response.json())
    .then((jsonData) => {
        const { categories, revenue } = jsonData;

        console.log(jsonData);

        const currentRevenue = revenue;
        const mappedData = currentRevenue.map((item) => ({
            ...item,
            category: categories[item.category],
        }));

        const formattedData = Object.values(
            formatValues(JSON.parse(JSON.stringify(mappedData)))
        );

        const consolidatedData = mappedData
            .reduce((acc, item) => {
                const existingItem = acc.find(
                    (i) => i.category.name === item.category.name
                );
                if (existingItem) {
                    existingItem.value += item.value;
                } else {
                    acc.push({ ...item });
                }
                return acc;
            }, [])
            .sort((a, b) => b.value - a.value);

        generateMillionDollarGrid(formattedData);
        generateRevenueBreakdown(consolidatedData);
    })
    .catch((error) => console.error("Error loading JSON:", error));

function formatValues(array) {
    let carryOver = 0;
    const result = [];
    const extraCarryOvers = [];

    function addCarryOverToNext(itemCategory, carryOverValue, currentIndex) {
        for (let i = currentIndex + 1; i < array.length; i++) {
            if (array[i].category.name === itemCategory.name) {
                array[i].value += carryOverValue;
                return;
            }
        }
        extraCarryOvers.push(carryOverValue);
    }

    array.forEach((item, index) => {
        let value = item.value + carryOver;
        carryOver = value % 1000;
        let squares = Math.floor(value / 1000);

        if (squares > 0) {
            result.push({ value: squares * 1000, category: item.category });
        }

        if (carryOver > 0) {
            addCarryOverToNext(item.category, carryOver, index);
            carryOver = 0;
        }
    });

    const totalExtraCarryOver = extraCarryOvers.reduce(
        (sum, value) => sum + value,
        0
    );
    if (totalExtraCarryOver >= 1000) {
        const extraSquares = Math.floor(totalExtraCarryOver / 1000);
        result.push({
            value: extraSquares * 1000,
            category: {
                name: "Combined",
                color: "bg-pink-500",
                link: "#revenue-breakdown",
            },
        });
    }

    return result;
}

function generateMillionDollarGrid(data) {
    const totalSquares = 1000;
    const squaresData = new Array(totalSquares).fill(null);

    let currentIndex = 0;
    data.forEach((item) => {
        const squaresCount = Math.floor(item.value / 1000);
        for (let i = 0; i < squaresCount; i++) {
            if (currentIndex < totalSquares) {
                squaresData[currentIndex] = item.category;
                currentIndex++;
            }
        }
    });

    // Create a mapping of category names to colors
    const categoryColors = Object.fromEntries(
        data.map((item) => [item.category.name, item.category.color])
    );

    const innerHTML = squaresData
        .map(
            (category, index) =>
                `<div class="w-3 h-3 relative">
            <a
                href="${category ? category.link : "/one-million/sponsor"}"
                target="_blank"
                class="block w-full h-full md:border md:dark:border-gray-800 relative group ${
                    category
                        ? categoryColors[category.name]
                        : "bg-gray-300 dark:bg-gray-800"
                } ${category ? "animate-scale-in" : ""}"
                style="animation-delay: ${
                    category ? `${index * 10}ms` : "0ms"
                };"
            >
                ${
                    category
                        ? `
                    <div class="opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition duration-200 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-700 rounded-md pointer-events-none whitespace-nowrap">
                        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-700 rotate-45"></div>
                        ${category.name}
                    </div>
                `
                        : ""
                }
            </a>
        </div>`
        )
        .join("");

    millionDollarGrid.innerHTML = innerHTML;
}

function generateRevenueBreakdown(data) {
    const innerHTML = `
        <table class="w-full border-collapse">
            <thead>
                <tr class="bg-gray-200 dark:bg-gray-800">
                    <th class="p-2 text-left">Project</th>
                    <th class="p-2 text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${data
                    .map(
                        (item) =>
                            `<tr class="border-b border-gray-200 dark:border-gray-700">
                                <td class="p-2 flex items-center">
                                    <div
                                        class="w-4 h-4 mr-2 ${
                                            item.category.color
                                        }"
                                    ></div>
                                    <a
                                        href=${item.category.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="flex items-center hover:underline"
                                    >
                                        ${item.category.name}
                                    </a>
                                </td>
                                <td class="p-2 text-right">
                                    ${item.value.toLocaleString()}
                                </td>
                            </tr>`
                    )
                    .join("")}
            </tbody>
            <tfoot>
                <tr class="font-semibold">
                    <td class="p-2">Total</td>
                    <td class="p-2 text-right">
                        ${data
                            .reduce((sum, item) => sum + item.value, 0)
                            .toLocaleString()}
                    </td>
                </tr>
            </tfoot>
        </table>
    `;

    revenueBreakdown.innerHTML = innerHTML;
}
