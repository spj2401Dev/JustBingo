<script>
  import { onMount } from "svelte";

  let words = [];
  let newWord = '';
  let wordType = 'Field';
  let wordTime = 0;
  
  onMount(async () => {
    await fetchWords();
  });

  async function fetchWords() {
    const res = await fetch('/api/admin/words');
    if (res.ok) {
      words = await res.json();
    } else {
      words = [];
    }
  }

  function addWordField() {
    words = [...words, { word: newWord, type: wordType, time: wordType === 'Timer' ? wordTime : 0 }];
    newWord = '';
    wordType = 'Field';
    wordTime = 0;
  }

  async function saveWords() {
    const res = await fetch('/api/admin/words', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ words }),
    });

    if (res.ok) {
      alert("Words saved successfully!");
    } else {
      alert("Failed to save words.");
    }
  }

  async function deleteWord(index) {
    words = words.filter((_, i) => i !== index);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ words }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "words.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = JSON.parse(e.target.result);
        if (content.words && Array.isArray(content.words)) {
          words = content.words;
        }
      };
      reader.readAsText(file);
    }
  }
</script>
<div class="container">
  <h1 class="title">Configure Words</h1>
  <p class="description">Add words to the bingo grid. All words are randomized.</p>
  <div class="words-container ">

    {#each words as word, index}
      <div class="word-item">
        <input type="text" class="word-field" bind:value={word.word} placeholder="Enter word" />

        <select class="word-type" bind:value={word.type}>
          <option value="Field">Field</option>
          <option value="Free">Free</option>
          <option value="Timer">Timer</option>
        </select>

        <button class="remove-button" on:click={deleteWord(index)}>X</button>

        {#if word.type === "Timer"}
          <input type="number" class="time-input" bind:value={word.time} placeholder="Sec" />
        {/if}

      </div>
    {/each}
  </div>

  <div class="action-buttons">
    <button on:click={addWordField} class="action-button">Add Word</button>
    <button on:click={saveWords} class="action-button">Save Words</button>
    <button on:click={exportJSON} class="action-button">Export JSON</button>
    <button on:click={() => document.querySelector('.file-input').click()} class="action-button">Import JSON</button>
    <input type="file" accept=".json" on:change={importJSON} class="file-input" style="display: none" />
  </div>
</div>

<style>
  @import "./admin.css";
</style>