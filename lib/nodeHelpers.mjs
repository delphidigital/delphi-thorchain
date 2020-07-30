import fns from 'date-fns';
const { addSeconds } = fns;

const blockTimeInSeconds = 5.5;

export function estimatedChurnOutTime({ activeSince, oldValidatorRate, lastBlock }) {
  const estimatedChurnOutBlock = activeSince + oldValidatorRate;
  const blocksUntilChurnOut = estimatedChurnOutBlock - lastBlock;
  const secondsUntilChurnOut = blocksUntilChurnOut * blockTimeInSeconds;
  const churnOutTime = addSeconds(new Date(), secondsUntilChurnOut);
  console.log({ activeSince, oldValidatorRate, lastBlock, estimatedChurnOutBlock, blocksUntilChurnOut, secondsUntilChurnOut, churnOutTime });
  return churnOutTime;
};


/*

**Which validators are marked as being old?**

At the start of every block, if blockHeight % OldValidatorRate (from constants) is
0, and there are more than MinimumNodesForBFT (from constants) + 2 active nodes, the oldest node
(in addition to all the bad nodes) is marked for removal by setting its leave_height to the
current block height.

**When does the removal actually happen?**

At the start of the block, if blockHeight % rotatePerBlockHeight is 0 then nextVaultNodeAccounts
is called which returns the new active validator set and churns out the old ones. This process
doesn't happen if a vault is being retired.

**How many validators to remove?**

There must always be more than MinimumNodesForBFT active validators and no more than
2/3 + 1 of the active nodes should be churned out at once:

maxRemoveCount = activeCount - ((activeCount * 2 / 3) + 1)
if (activeCount - maxRemoveCount < MinimumNodesForBFT) {
  maxRemoveCount = 0;
}

**Which to remove if there are more validators to remove than the max allowed?**

In order of priority: nodes which have forcedToLeave, requestedToLeave statuses then bad actors
and old nodes by their leave_height

-------------------------------------------

---
[forcedToLeave nodes]
[requestedToLeave nodes]    <- these will likely churn next churn point
[leave_height set]
----
[ordered by age]            <- will be marked to churn every OldValidatorRate blocks

  sort.SliceStable(active, func(i, j int) bool {
    if active[i].ForcedToLeave != active[j].ForcedToLeave {
      return active[i].ForcedToLeave
    }
    if active[i].RequestedToLeave != active[j].RequestedToLeave {
      return active[i].RequestedToLeave
    }
    // sort by LeaveHeight ascending , but exclude LeaveHeight == 0 , because that's the default value
    if active[i].LeaveHeight == 0 && active[j].LeaveHeight > 0 {
      return false
    }
    if active[i].LeaveHeight > 0 && active[j].LeaveHeight == 0 {
      return true
    }
    return active[i].LeaveHeight < active[j].LeaveHeight
  })
  
*/


