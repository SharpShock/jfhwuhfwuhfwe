# Keep Talking and Nobody Explodes - Clone

A fully functional and highly detailed clone of the popular cooperative bomb defusal game "Keep Talking and Nobody Explodes".

## About the Game

Keep Talking and Nobody Explodes is a cooperative game where one player (the Defuser) can see the bomb but doesn't know how to defuse it, while other players (the Experts) have the manual but can't see the bomb. Players must communicate effectively to defuse the bomb before time runs out!

## Features

### 8 Unique Bomb Modules
1. **Simple Wires** - Cut the correct wire based on color patterns and rules
2. **The Button** - Press or hold the button based on its color and label
3. **Keypads** - Press symbols in the correct order
4. **Simon Says** - Repeat color sequences with translation rules
5. **Who's On First** - Word recognition and selection puzzle
6. **Memory** - Multi-stage memory challenge
7. **Morse Code** - Decode morse messages and set the correct frequency
8. **Complicated Wires** - Complex wire cutting with multiple criteria

### Game Features
- **3 Difficulty Levels**: Easy (3-4 modules), Medium (5-6 modules), Hard (7-8 modules)
- **Dynamic Timer**: Countdown timer that changes color as time runs out
- **Strike System**: 3 strikes allowed before game over
- **Bomb Edgework**: Batteries, serial plate, and indicator lights shown on the bomb casing
- **Serial Number**: Randomly generated and shown on the back panel, affects module solutions
- **Comprehensive Manual**: Detailed instruction manual with bomb casing details
- **Sound Effects**: Audio feedback for actions and events
- **Responsive Design**: Works on desktop and mobile devices
- **Win/Lose Screens**: Clear feedback on game completion

### Visual Features
- Enhanced bomb casing with multi-panel views
- Arrow key bomb rotation to inspect edgework
- Smooth animations and transitions
- Visual feedback for correct/incorrect actions
- Module highlighting when solved
- Pulsing timer warnings

## How to Play

1. **Open `index.html`** in a web browser
2. **Select Difficulty** from the main menu
3. **Start Game** to begin defusing
4. **For Defuser**: Describe what you see on the bomb to your team
5. **For Experts**: Open the manual (separate window/device) and guide the defuser
6. **Defuse All Modules** before time runs out with fewer than 3 strikes

## Gameplay Tips

- The **Serial Number** is crucial - many modules depend on it
- **Communicate clearly** - describe colors, positions, and symbols precisely
- **Stay calm** under pressure - panicking leads to mistakes
- **Read instructions carefully** - follow the manual rules exactly
- Each module must be **solved completely** to win

## Technical Details

- **Pure HTML/CSS/JavaScript** - No frameworks or dependencies required
- **Web Audio API** for sound effects
- **Responsive grid layout** for modules
- **LocalStorage ready** for settings persistence
- **Mobile-friendly** interface

## Module Rules Summary

### Simple Wires
Cut the correct wire based on:
- Number of wires (3-6)
- Wire colors
- Serial number (odd/even)

### The Button
Decide whether to tap or hold based on:
- Button color (red, blue, yellow, white)
- Button text
- Release timing if holding

### Keypads
- Match 4 symbols to one of 6 columns
- Press them in the order shown in that column

### Simon Says
- Repeat sequences with color translation
- Translation changes based on serial number and strikes

### Who's On First
- Two-stage word puzzle
- Read display word, find button position
- Press correct button from priority list

### Memory
- 5-stage memory challenge
- Remember positions and labels from previous stages

### Morse Code
- Decode flashing morse code
- Set radio frequency to correct value
- 16 possible words

### Complicated Wires
- Cut wires based on multiple properties
- Red/blue color, LED status, star symbol
- Uses serial number and other bomb features

## Development

The game is built with:
- **HTML5** for structure
- **CSS3** for styling and animations
- **Vanilla JavaScript** for game logic

All game logic is self-contained with no external dependencies, making it easy to deploy and modify.

## Credits

This is a fan-made clone inspired by "Keep Talking and Nobody Explodes" by Steel Crate Games. This project is for educational purposes only.

## License

This is a fan project. The original game "Keep Talking and Nobody Explodes" is owned by Steel Crate Games.
