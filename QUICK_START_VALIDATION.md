# Validation Test - Quick Start Guide

## Objective
Prove that the Phase A editor architecture works end-to-end with a simple entity lifecycle test.

## What You're Testing

The test validates that:
1. **Scene Graph** is the single source of truth
2. **EditorEngine** controls all mutations
3. **Events** propagate to independent observers
4. **All UI panels stay synchronized** (no sync bugs)
5. **Undo/Redo work perfectly** across all systems

---

## Getting Started

### Step 1: Start the Application
```bash
cd /Users/jonathan/elco/gazeboworldeditor
npm run dev
```

### Step 2: Navigate to Viewport
Open browser → Click to viewport page

### Step 3: Look for Test Panel
Bottom-right corner of the viewport will show **"Entity Lifecycle Validation Test"** panel.

If not visible, click the "Show validation test" button in the bottom-right.

---

## Test Scenario #1: Create Entity

### Action
1. Click **"Create Box"** button in the test panel

### What to Look For
```
✓ Viewport: Blue box mesh appears at origin (0,0,0)
✓ Scene Tree: New entity appears in left panel hierarchy
✓ XML Panel: Entity appears in SDF XML serialization
✓ Status: Shows "Box created: entity_box_1" or similar ID
✓ Console: No errors, shows [ENGINE] and [VIEWPORT] logs
```

### Expected Console Output
```
[TEST] Box created: entity_box_1
[ENGINE] Entity created: entity_box_1
[VIEWPORT] Entity created event received
[TREE] Rebuilding tree from scene graph
[XML] Serialized, length: 1456
```

### Success Criteria
- [ ] Mesh visible in viewport
- [ ] Entity in scene tree
- [ ] Entity in XML panel
- [ ] All three in sync
- [ ] No console errors

---

## Test Scenario #2: Undo Entity Creation

### Action
1. Press **Ctrl+Z** (or Cmd+Z on Mac)
2. Or click **"Undo (Ctrl+Z)"** button

### What to Look For
```
✓ Viewport: Blue box disappears
✓ Scene Tree: Entity removed from hierarchy
✓ XML Panel: Entity removed from serialization
✓ Status: Shows "Undo executed"
✓ Console: No errors
```

### Expected Console Output
```
[TEST] Undo called
[ENGINE] Undo executed
[VIEWPORT] Entity deleted event received
[TREE] Rebuilding tree from scene graph
[XML] Serialized, length: 234
```

### Success Criteria
- [ ] Mesh gone from viewport
- [ ] Entity removed from tree
- [ ] Entity removed from XML
- [ ] All three synchronized
- [ ] No console errors

---

## Test Scenario #3: Redo Entity Creation

### Action
1. Press **Ctrl+Y** (or Cmd+Y on Mac)
2. Or click **"Redo (Ctrl+Y)"** button

### What to Look For
```
✓ Viewport: Blue box reappears
✓ Scene Tree: Entity reappears in hierarchy
✓ XML Panel: Entity reappears in serialization
✓ Status: Shows "Redo executed"
✓ **CRITICAL**: Entity has SAME ID as before (not new entity)
```

### Expected Console Output
```
[TEST] Redo called
[ENGINE] Redo executed
[VIEWPORT] Entity created event received
[TREE] Rebuilding tree from scene graph
[XML] Serialized, length: 1456
```

### Success Criteria
- [ ] Mesh returns to viewport
- [ ] Entity returns to tree
- [ ] Entity returns to XML
- [ ] Entity ID unchanged (same as original)
- [ ] All three synchronized
- [ ] No console errors

---

## Test Scenario #4: Multiple Entities

### Action
1. Click **"Create Box"** button
2. Click **"Create Sphere"** button

### What to Look For
```
✓ Viewport: Blue box + green sphere both visible
✓ Scene Tree: Two entities in hierarchy (different names)
✓ XML Panel: Both entities in serialization
✓ Status: Counter shows 2
✓ Entity IDs unique
```

### Success Criteria
- [ ] Both meshes in viewport
- [ ] Both in scene tree
- [ ] Both in XML
- [ ] Different IDs (not the same entity twice)
- [ ] Different names (box_1, sphere_1)

---

## Test Scenario #5: Undo Multiple

### Action
1. Press Ctrl+Z (undo sphere)
2. Press Ctrl+Z (undo box)

### What to Look For
```
✓ First Undo: Sphere disappears (box remains)
✓ Second Undo: Box disappears (scene empty)
✓ All three panels synchronized
```

### Success Criteria
- [ ] Undo order correct (LIFO - last in, first out)
- [ ] Sphere removed first
- [ ] Box removed second
- [ ] Scene empty after both undos
- [ ] All panels match

---

## Complete Test Checklist

Use this to verify everything works:

### Create Workflow
- [ ] Create Box visible in viewport
- [ ] Create Box visible in scene tree
- [ ] Create Box visible in XML
- [ ] All three synchronized

### Undo Workflow
- [ ] Box disappears from viewport
- [ ] Box removed from tree
- [ ] Box removed from XML
- [ ] All three synchronized

### Redo Workflow
- [ ] Box reappears in viewport
- [ ] Box reappears in tree
- [ ] Box reappears in XML
- [ ] Entity ID unchanged
- [ ] All three synchronized

### Multiple Entities
- [ ] Both meshes in viewport
- [ ] Both in tree
- [ ] Both in XML
- [ ] Different IDs
- [ ] Different names

### Error Handling
- [ ] No console errors
- [ ] Status messages accurate
- [ ] All buttons responsive
- [ ] Keyboard shortcuts work

### Architecture Validation
- [ ] Viewport reads from scene graph (not cached)
- [ ] Tree reads from scene graph (not cached)
- [ ] XML generates from scene graph (not cached)
- [ ] No observer calls another observer
- [ ] EditorEngine is single entry point

---

## Common Issues & Solutions

### Issue: "Create Box" button does nothing
**Solution**: Check console for errors. Likely issue:
- EditorEngine not imported correctly
- getEditorEngine() returning null
- createPrimitive() method missing from EditorEngine

### Issue: Box appears in viewport but not in tree
**Solution**: SceneTreeObserver not listening or not instantiated
- Check if SceneTreeObserver is created in viewport
- Check if it's subscribed to ENTITY_CREATED event
- Check scene tree panel is rendered

### Issue: Undo/Redo doesn't work
**Solution**: Check CommandSystem
- Verify command is recorded when entity created
- Check that undo/redo methods exist on engine
- Look for "Undo executed" in console

### Issue: Entity IDs change on redo
**Solution**: This is a critical bug - means redo is creating new entity
- Verify CommandSystem.redo() is truly redoing, not re-executing
- Check that entity ID comes from command, not generated new
- This should FAIL validation

---

## Console Commands for Debugging

Open browser console (F12) and try:

```javascript
// Get the editor engine
const engine = window.__editorEngine || require('@/engine/editorEngine').getEditorEngine()

// Create entity manually
const id = engine.createPrimitive('box')
console.log('Created:', id)

// Get current scene
const world = engine.getWorld()
console.log('World:', world)
console.log('Models:', world.models)

// Test undo
engine.undo()

// Test redo
engine.redo()
```

---

## Sign-Off

When all test scenarios pass ✓:

**Architecture Proven** ✓
- Scene graph is centralized
- Events propagate correctly
- Observers are independent
- No sync bugs
- Undo/redo perfect

**Ready for Phase B** ✓
- Can build on solid foundation
- No architectural rewrites needed
- Can add features with confidence

---

## Next Steps

### If Validation Passes (All Checkboxes ✓)
1. Update VALIDATION_CHECKLIST.md with results
2. Commit code with message: "Phase B: Validation test complete and passing"
3. Start Phase B.2: Event persistence and snapshots
4. Do NOT proceed to Phase B.2 until validation complete

### If Validation Fails (Some Checkboxes ✗)
1. Document exactly what failed
2. Debug the issue (check console, check logs)
3. Fix in the appropriate layer:
   - UI issue → Fix component
   - Engine issue → Fix EditorEngine
   - State issue → Fix SceneGraphManager
   - Event issue → Fix EventBus
4. Retest until all checkboxes pass

---

## Success!

When you see:
1. ✓ Create box → appears everywhere
2. ✓ Ctrl+Z → disappears everywhere
3. ✓ Ctrl+Y → reappears everywhere with same ID
4. ✓ Multiple entities work perfectly
5. ✓ No console errors

**You have proven the architecture works.** 

Proceed with confidence to Phase B.
