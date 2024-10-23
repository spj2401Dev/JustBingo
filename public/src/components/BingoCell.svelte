<script>
    export let word;

    let marked = false;
    let disabled = false;

    const toggleMarked = () => {
        marked = !marked;
        disabled = false;
    };

    const toggleDisabled = (event) => {
        event.preventDefault();
        disabled = !disabled;
        marked = false;
    };
</script>

<button 
    type="button"
    class="bingo-cell"
    class:marked={marked}
    class:disabled={disabled}
    on:click={toggleMarked}
    on:contextmenu={toggleDisabled}
    on:keydown={(event) => { if (event.key === 'Enter' || event.key === ' ') toggleMarked(); }}
    aria-pressed={marked}
    aria-disabled={disabled}>
    {word.word}
</button>
