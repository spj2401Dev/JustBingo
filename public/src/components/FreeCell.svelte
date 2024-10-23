<script>
    export let word;

    let marked = false;
    let disabled = false;

    const toggleMarked = () => {
        marked = !marked;
        disabled = false;
    };
</script>

<button 
    type="button"
    class="bingo-cell"
    class:marked={marked}
    on:click={toggleMarked}
    on:contextmenu={(event) => { event.preventDefault()}}
    on:keydown={(event) => { if (event.key === 'Enter' || event.key === ' ') toggleMarked(); }}
    aria-pressed={marked}
    aria-disabled={disabled}>
    {word.word}
</button>
