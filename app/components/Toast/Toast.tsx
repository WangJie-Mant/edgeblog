interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
}

export default function Toast({ message, type = "info" }: ToastProps) {
  return (
    <div className="toast toast-top toast-center n4-toast toast-slide pointer-events-none">
      <div className={`alert alert-${type} n4-toast-alert pointer-events-auto`}>
        <span>{message}</span>
      </div>
    </div>
  );
}
