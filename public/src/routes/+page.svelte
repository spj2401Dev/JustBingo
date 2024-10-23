<script>
    import { onMount } from 'svelte';
    import BingoCell from '../components/BingoCell.svelte';
    import FreeCell from '../components/FreeCell.svelte';
    import TimerCell from '../components/TimerCell.svelte';

    let words = [];
    let freeWord = null;
    let bingoGrid = [];

    const fetchWords = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/words');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching the words:', error);
            return [];
        }
    };

    onMount(async () => {
        words = await fetchWords();
        const freeWords = words.filter(word => word.type === 'Free');
        if (freeWords.length > 0) {
            freeWord = freeWords[Math.floor(Math.random() * freeWords.length)];
        }
        const filteredWords = words.filter(word => word !== freeWord).slice(0, 24);
        bingoGrid = [...filteredWords.slice(0, 12), freeWord, ...filteredWords.slice(12)];
    });
</script>

<div class="bingo-container">
    <div class="bingo-title">
        <div class="bingo-letter">D</div>
        <div class="bingo-letter">A</div>
        <div class="bingo-letter">I</div>
        <div class="bingo-letter">L</div>
        <div class="bingo-letter">Y</div>
    </div>
    <div class="bingo-grid">
        {#each bingoGrid as word, index}
            {#if index === 12}
                <FreeCell word={word} />
            {:else if word.type === 'Field'}
                <BingoCell word={word} />
            {:else if word.type === 'Timer'}
                <TimerCell word={word} />
            {/if}
        {/each}
    </div>
</div>
