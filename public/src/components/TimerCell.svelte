<script>
    export let word;
    
    let timer = word.duration || 10;  // Example starting value in seconds
    let intervalId;
    let running = false;

    const startTimer = () => {
        if (!running) {
            running = true;
            intervalId = setInterval(() => {
                if (timer > 0) {
                    timer -= 1;
                } else {
                    clearInterval(intervalId);
                    running = false;
                }
            }, 1000);
        }
    };

    const pauseTimer = () => {
        clearInterval(intervalId);
        running = false;
    };

    const resetTimer = () => {
        pauseTimer();
        timer = word.duration || 10;
    };
</script>

<div class="bingo-cell timer-cell" on:click={running ? pauseTimer : startTimer} on:contextmenu={resetTimer}>
    {word.word}: {timer}s
</div>

<style>
    .timer-cell {
        background-color: lightblue;
    }
    .paused {
        background-color: darkgray;
    }
</style>
