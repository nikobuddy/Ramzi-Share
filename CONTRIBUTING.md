# Contributing to RamziShare connect

First off, thank you for considering contributing to RamziShare connect! It's people like you that make RamziShare connect such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [your-email@example.com] or through GitHub issues.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if applicable**
- **Include your environment details** (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the TypeScript and Tailwind CSS styleguides
- Include thoughtfully-worded, well-structured tests
- Document new code based on the Documentation Styleguide
- End all files with a newline

## Development Process

### Getting Started

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Ramzi-Share.git
   cd Ramzi-Share
   ```

3. **Add the original repository as upstream**
   ```bash
   git remote add upstream https://github.com/nikobuddy/Ramzi-Share.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create a branch for your feature**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

### Making Changes

1. **Start the development server**
   ```bash
   # Terminal 1 - React dev server
   npm run dev:client
   
   # Terminal 2 - Backend server
   npm run dev:server
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow TypeScript best practices
   - Use Tailwind CSS for styling
   - Add comments where necessary
   - Update documentation if needed

3. **Test your changes**
   - Test all functionality manually
   - Check for TypeScript errors: `npm run build`
   - Ensure responsive design works on mobile/tablet/desktop

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: fix bug description"
   ```

   **Commit message guidelines:**
   - Use the present tense ("add feature" not "added feature")
   - Use the imperative mood ("move cursor to..." not "moves cursor to...")
   - Limit the first line to 72 characters or less
   - Reference issues and pull requests liberally after the first line
   - Use conventional commits format:
     - `feat:` for new features
     - `fix:` for bug fixes
     - `docs:` for documentation changes
     - `style:` for formatting changes
     - `refactor:` for code refactoring
     - `test:` for adding tests
     - `chore:` for maintenance tasks

### Submitting Changes

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template
   - Submit the PR

3. **Keep your branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   git push origin feature/your-feature-name --force-with-lease
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable and function names
- Add JSDoc comments for public functions

### Tailwind CSS

- Use Tailwind utility classes for styling
- Follow mobile-first responsive design
- Use semantic class names when needed
- Keep components modular and reusable

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Use semicolons
- Maximum line length: 100 characters

### File Structure

```
src/
├── components/     # Reusable React components
├── pages/          # Page components
├── types/          # TypeScript type definitions
├── styles/         # Global styles
├── utils/          # Utility functions
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Project Structure

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Real-time**: Socket.io
- **Build Tool**: Vite

## Testing

While we don't have automated tests yet, please:

- Test your changes manually
- Test on different browsers (Chrome, Firefox, Safari)
- Test on different devices (mobile, tablet, desktop)
- Test edge cases and error scenarios

## Documentation

- Update README.md if you add new features
- Add JSDoc comments for new functions
- Update API documentation if endpoints change
- Keep code comments clear and concise

## Questions?

Feel free to open an issue for any questions you might have about contributing.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to RamziShare connect! 🎉

