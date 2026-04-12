<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>
        <span class="text-accent">🦂</span> ScorpionCode
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn text>Posts</v-btn>
      <v-btn text>About</v-btn>
      <v-btn color="accent" variant="tonal">Subscribe</v-btn>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <v-card color="surface" rounded="xl">
          <v-card-text>
            <v-chip color="accent" text-color="white" size="small"># coding</v-chip>
            <h1 class="text-primary mt-4">Welcome to ScorpionCode</h1>
            <p class="text-medium-emphasis">
              Sting like a scorpion, <span class="text-accent">code like a pro.</span>
            </p>
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-code-tags">
              Read Blog
            </v-btn>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>