# AI-Assisted Development Best Practices

## Overview

This guide outlines best practices for effective collaboration between human engineers and AI assistants in the development process.

## Core Principles

### 1. Human-in-the-Loop (HITL)

**The human engineer is always the decision-maker.** AI assists, humans approve.

#### When to Pause and Ask
- **Ambiguous requirements** - Multiple valid interpretations exist
- **Architectural decisions** - Affects project structure or patterns
- **Breaking changes** - Could impact existing functionality
- **Security implications** - Authentication, authorization, data handling
- **Performance trade-offs** - Different approaches with different costs
- **External dependencies** - Adding new packages or services

#### When to Proceed Autonomously
- **Clear, specific requests** - "Add a button that does X"
- **Following established patterns** - Matching existing code style
- **Non-breaking additions** - New features that don't affect existing code
- **Documentation updates** - Clarifying or expanding docs
- **Bug fixes with clear root cause** - Observable issue with known solution

### 2. Transparency and Communication

#### Show Your Work
Always explain:
- What you're doing and why
- What files you're modifying
- What commands you're running
- What decisions you've made

#### Progressive Disclosure
- Start with brief explanations for simple tasks
- Provide detailed context for complex changes
- Increase verbosity when dealing with critical systems

#### Acknowledge Uncertainty
When unsure:
```
"I see two approaches here:
1. [Approach A] - Benefits: X, Drawbacks: Y
2. [Approach B] - Benefits: X, Drawbacks: Y

Which would you prefer?"
```

### 3. Incremental Development

#### Small, Verifiable Steps
- Make one logical change at a time
- Test after each significant change
- Commit working states frequently

#### Checkpoint Pattern
```
1. Propose approach
2. Get approval (if needed)
3. Implement first step
4. Verify it works
5. Proceed to next step
```

#### Avoid Big Bang Changes
Don't:
- Refactor multiple files simultaneously without checkpoints
- Change architecture and add features in one go
- Make untested assumptions about dependencies

Do:
- Break work into phases
- Deliver working increments
- Validate each step

## Communication Patterns

### Effective Requests to AI

#### Good Examples
```
✓ "Add a character card component using shadcn-svelte Card"
✓ "Fix the TypeScript error in character-service.ts on line 45"
✓ "Refactor the getUserById function to use async/await"
✓ "Add unit tests for the CharacterService class"
```

#### Examples Needing Clarification
```
? "Make it better" - Better in what way?
? "Fix the bug" - Which bug? What's the expected behavior?
? "Add error handling" - For which functions? What error scenarios?
? "Optimize performance" - What's slow? What are the metrics?
```

### Effective AI Responses

#### For Simple Tasks
```
Brief explanation → Action → Result confirmation

"I'll add the import statement at the top of the file."
[makes change]
"Added import for Character type."
```

#### For Complex Tasks
```
1. Acknowledge the request
2. Explain the plan (numbered steps if multi-step)
3. Note any assumptions or decisions
4. Execute
5. Summarize what was done
```

#### When Asking Questions
```
Context: "I need to add error handling to the API calls."

Question: "Should we:
1. Retry failed requests automatically (with exponential backoff)?
2. Show error messages to users immediately?
3. Log errors and fail silently?

I'd recommend option 1 for network errors and option 2 for validation errors."
```

## Development Workflows

### Feature Development Workflow

1. **Understand Requirements**
   - Read the request carefully
   - Check existing code for patterns
   - Identify dependencies

2. **Check Existing Solutions**
   - Search for similar implementations
   - Check if shadcn-svelte components exist
   - Review shared packages/utilities

3. **Plan Approach**
   - Break down into steps
   - Identify files to modify/create
   - Note potential issues

4. **Implement Iteratively**
   - Start with smallest testable unit
   - Build up functionality
   - Test frequently

5. **Verify and Document**
   - Test the feature
   - Check for errors
   - Update relevant documentation

### Debugging Workflow

1. **Reproduce the Issue**
   - Understand the error message
   - Identify the failing component
   - Check recent changes

2. **Diagnose Root Cause**
   - Review error stack traces
   - Check type errors
   - Examine data flow

3. **Propose Fix**
   - Explain what's wrong
   - Suggest solution
   - Note any side effects

4. **Implement and Verify**
   - Apply the fix
   - Test the specific scenario
   - Check for regressions

5. **Prevent Recurrence**
   - Add tests if appropriate
   - Update documentation
   - Consider architectural improvements

### Refactoring Workflow

1. **Identify Improvement**
   - Explain what needs refactoring
   - State the benefits
   - Assess the risk

2. **Plan Refactoring**
   - Ensure tests exist (or create them)
   - Plan backward-compatible path if possible
   - Identify all affected code

3. **Refactor Incrementally**
   - One logical change at a time
   - Verify tests pass after each step
   - Don't mix refactoring with new features

4. **Validate**
   - Run all tests
   - Check type errors
   - Verify functionality unchanged

## Error Handling

### When Errors Occur

#### Don't Hide Errors
```
❌ "I tried to fix it but there's still an error. Moving on..."
✓ "I encountered a TypeScript error: [error]. This suggests [diagnosis]. 
   Let me [proposed fix]."
```

#### Provide Context
```
Error: Cannot find module 'X'

Response:
"This error indicates the module 'X' isn't installed. 
I'll check package.json to see if it's listed, then:
- If listed: run pnpm install
- If not: add it with pnpm add X
- If workspace package: check the dependency setup"
```

#### Recovery Strategy
1. **Acknowledge the error**
2. **Explain what went wrong**
3. **Propose solution(s)**
4. **Execute fix**
5. **Verify resolution**

## Testing Practices

### Test as You Go
- Run code after writing it
- Check for TypeScript errors frequently
- Test edge cases, not just happy paths

### Verification Checklist
Before declaring work complete:
- [ ] Code compiles without errors
- [ ] Types are correct
- [ ] No console errors
- [ ] Functionality works as expected
- [ ] Existing features still work
- [ ] Code follows project patterns

## Quality Standards

### Code Review Self-Check
Before finalizing changes, review:
- **Readability** - Is the code clear?
- **Consistency** - Does it match project patterns?
- **Completeness** - Are edge cases handled?
- **Testability** - Can this be tested?
- **Documentation** - Is complex logic explained?

### Red Flags to Avoid
- **Magic numbers** - Use named constants
- **Deep nesting** - Refactor to reduce complexity
- **Giant functions** - Break into smaller pieces
- **Unclear names** - Use descriptive identifiers
- **Commented-out code** - Remove it
- **TODO without context** - Explain what needs doing

## Collaboration Patterns

### Paired Programming with AI

#### Human Responsibilities
- Define goals and requirements
- Make architectural decisions
- Review and approve changes
- Test and validate
- Provide business context

#### AI Responsibilities
- Suggest implementations
- Write boilerplate code
- Find existing patterns
- Check for errors
- Research best practices
- Explain technical concepts

### Iterative Refinement
```
Human: "Add a character list page"
AI: [Creates basic implementation]
Human: "Add filtering by class"
AI: [Adds filter component]
Human: "Make it responsive"
AI: [Adds responsive styles]
```

This iterative approach:
- Keeps changes manageable
- Allows course correction
- Builds complexity gradually
- Maintains working states

## Anti-Patterns to Avoid

### For AI Assistants
- ❌ Making assumptions about unclear requirements
- ❌ Changing files without explanation
- ❌ Ignoring errors and moving forward
- ❌ Using deprecated or outdated approaches
- ❌ Creating unnecessary abstraction
- ❌ Over-engineering simple solutions

### For Human Engineers
- ❌ Vague requests without context
- ❌ Accepting code without understanding it
- ❌ Skipping testing because "AI wrote it"
- ❌ Not reviewing generated code
- ❌ Expecting AI to read your mind
- ❌ Treating AI as infallible

## Success Metrics

### Effective AI Assistance
- Code works on first try (or requires minimal fixes)
- Follows established project patterns
- Minimal back-and-forth for clarification
- Appropriate level of detail in explanations
- Proactive error checking

### Effective Collaboration
- Clear communication both directions
- Mutual understanding of goals
- Incremental progress
- High code quality
- Efficient iteration cycles

## Summary

**The best AI-assisted development happens when:**
1. Requirements are clear and specific
2. AI explains its actions transparently
3. Changes are incremental and tested
4. Humans review and validate
5. Both parties communicate openly
6. Standards and patterns are followed

**Remember:** AI is a powerful tool, but human judgment, creativity, and domain expertise are irreplaceable. Use AI to amplify your capabilities, not replace your thinking.
