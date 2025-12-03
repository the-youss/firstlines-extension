import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


type Props = {
  title: string,
  description: string,
  continueBtn: {
    title?: string,
    onClick: () => Promise<any>,
  },
  cancelBtn?: {
    title?: string,
    onClick: () => Promise<any>,
  },
}

export const useAlert = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [continueBtn, setContinueBtn] = useState<Props['continueBtn']>({
    title: 'Continue',
    onClick: async () => { },
  });
  const [cancelBtn, setCancelBtn] = useState<Props['cancelBtn']>({
    title: 'Cancel',
    onClick: async () => { },
  });

  const triggerAlert = useCallback((args: Props) => {
    setTitle(args.title);
    setDescription(args.description);
    setContinueBtn({
      ...continueBtn,
      onClick: async () => {
        await args.continueBtn.onClick()
        setOpen(false)
      },
    });
    setCancelBtn({
      ...cancelBtn,
      onClick: async () => {
        await args.cancelBtn?.onClick();
        setOpen(false)
      },
    });
    setOpen(true);
  }, [])

  return {
    ui: (
      (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>
                {description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelBtn?.onClick}>{cancelBtn?.title ?? 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={continueBtn.onClick}>{continueBtn.title}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    ),
    triggerAlert
  }
}