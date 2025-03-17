<template>
  <div class="anime-page">
    <!-- Header navigation -->
    <div class="header">
      <div class="logo">
        <img src="https://picsum.photos/180/60" alt="Anime Logo" />
      </div>
      <nav class="main-nav">
        <ul>
          <li
            v-for="(item, index) in menuItems"
            :key="index"
            :class="{ active: item.text === 'CHARACTER' }"
          >
            <a href="#">{{ item.text }}</a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Character section title -->
    <div class="character-title-section">
      <h2>キャラクター</h2>
      <div class="title-main">CHARACTER</div>
      <div class="subtitle">Train to the End of the World</div>
      <div class="color-dots">
        <span class="dot red"></span>
        <span class="dot orange"></span>
        <span class="dot pink"></span>
        <span class="dot blue"></span>
      </div>
    </div>

    <!-- Character selection circles -->
    <div class="character-circles">
      <div
        v-for="(character, index) in characters"
        :key="index"
        class="character-circle"
        :class="{ active: index === 0 }"
      >
        <img
          :src="`https://picsum.photos/100/100?random=${index}`"
          :alt="character"
        />
      </div>
    </div>

    <!-- Main character display -->
    <div class="main-character">
      <div class="character-image">
        <img src="https://picsum.photos/400/500" alt="Main Character" />
      </div>
      <div class="character-info">
        <div class="character-name-section">
          <div class="character-romaji">Chikura Shizuru</div>
          <div class="character-japanese">
            <span class="kanji">千倉</span>
            <span class="kanji red">静</span>
            <span class="kanji">留</span>
          </div>
          <div class="character-cv">
            <span class="cv-label">CV</span>
            <span class="cv-name">安済知佳</span>
          </div>
        </div>
        <div class="character-description">
          みんなと一緒に電車で、突然いなくなった親友を探しに行く。考えるより先に体が動く性分で、頼れるようなあっておけないようなリーダー。担災からもらった柔術が得意で、身体能力にも自信をもっている。
        </div>

        <!-- Additional character poses -->
        <div class="character-poses">
          <div v-for="i in 3" :key="`pose-${i}`" class="character-pose">
            <img
              :src="`https://picsum.photos/150/150?random=${i + 10}`"
              :alt="`Character Pose ${i}`"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import { ref } from "vue";

const menuItems = ref([
  { text: "NEWS", link: "#" },
  { text: "STAFF&CAST", link: "#" },
  { text: "STORY", link: "#" },
  { text: "ON AIR", link: "#" },
  { text: "CHARACTER", link: "#" },
  { text: "GOODS", link: "#" },
  { text: "Blu-ray/DVD", link: "#" },
  { text: "MOVIE", link: "#" },
  { text: "SPECIAL", link: "#" },
  { text: "HERE", link: "#" },
]);

const characters = ref([
  "Character 1",
  "Character 2",
  "Character 3",
  "Character 4",
  "Character 5",
  "Character 6",
  "Character 7",
  "Character 8",
]);
</script>
  
  <style scoped>
.anime-page {
  font-family: "Arial", sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f5f5;
  background-image: url("https://picsum.photos/1200/800?grayscale");
  background-blend-mode: overlay;
  padding-bottom: 50px;
}

/* Header styling */
.header {
  display: flex;
  align-items: center;
  background-color: #dac374;
  padding: 10px 20px;
  border-radius: 0 0 10px 10px;
}

.logo {
  margin-right: 30px;
}

.main-nav ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 10px;
}

.main-nav li {
  padding: 8px 12px;
  font-weight: bold;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.main-nav li.active {
  background-color: #c05b9d;
  color: white;
}

.main-nav a {
  text-decoration: none;
  color: inherit;
  font-size: 14px;
}

/* Character title section */
.character-title-section {
  text-align: center;
  margin: 40px 0;
}

.character-title-section h2 {
  color: #666;
  font-size: 14px;
  margin-bottom: 0;
}

.title-main {
  color: #8e447e;
  font-size: 50px;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.subtitle {
  color: #8e447e;
  font-size: 16px;
  margin-bottom: 10px;
}

.color-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
}

.dot.red {
  background-color: #e63232;
}
.dot.orange {
  background-color: #ff9800;
}
.dot.pink {
  background-color: #ff6ec5;
}
.dot.blue {
  background-color: #304ffe;
}

/* Character circles */
.character-circles {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.character-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.character-circle.active {
  border-color: #e63232;
  transform: scale(1.05);
}

.character-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Main character display */
.main-character {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.character-image img {
  max-height: 500px;
  object-fit: contain;
}

.character-info {
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.character-name-section {
  margin-bottom: 20px;
}

.character-romaji {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.character-japanese {
  font-size: 50px;
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.kanji {
  display: inline-block;
}

.kanji.red {
  color: #e63232;
}

.character-cv {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.cv-label {
  background-color: #ffd600;
  color: #333;
  font-size: 14px;
  padding: 3px 8px;
  border-radius: 50%;
}

.cv-name {
  font-size: 14px;
}

.character-description {
  line-height: 1.6;
  font-size: 14px;
  color: #333;
}

.character-poses {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.character-pose {
  width: 90px;
  height: 90px;
  border-radius: 5px;
  overflow: hidden;
}

.character-pose img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 10px;
  }

  .logo {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .main-nav ul {
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
  }

  .title-main {
    font-size: 40px;
  }

  .character-circle {
    width: 60px;
    height: 60px;
  }

  .main-character {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .character-japanese {
    font-size: 36px;
  }
}

@media (max-width: 480px) {
  .title-main {
    font-size: 30px;
  }

  .main-nav li {
    padding: 6px 8px;
    font-size: 12px;
  }

  .character-circle {
    width: 45px;
    height: 45px;
  }

  .character-japanese {
    font-size: 28px;
  }

  .character-poses {
    justify-content: center;
  }
}
</style>