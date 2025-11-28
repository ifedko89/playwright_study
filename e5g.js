const getHiddenCard = (card, num=4) => {
    let hidden = '*'.repeat(num)
    let last = card.slice(-4)
    console.log(hidden)
}

getHiddenCard(1002342342345678, 5)