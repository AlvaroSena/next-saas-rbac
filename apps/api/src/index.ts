import { ability } from '@saas/auth'

const userCanInviteSomeoneElse = ability.can('invite', 'User')
const userCanDeleteOtherUsers = ability.can('delete', 'User')

const userCannotDeleteOthersUsers = ability.cannot('delete', 'User')

console.log(userCannotDeleteOthersUsers)