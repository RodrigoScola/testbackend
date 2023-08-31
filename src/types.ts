export type NewMessageInfo = {
  postId: number
  id: number
  name: string
  email: string
  body: string
}
export type MessageInfo = NewMessageInfo & {
  user_name: string
}
export interface EmployeeInfo {
  name: string
  email: string
  telephone: string
  company: string
}

export interface HiredEmployeeInfo extends EmployeeInfo {
  created_at: string
  id: string
}
