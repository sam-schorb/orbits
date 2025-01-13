import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function HelpModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#e6e6e6] border-none sm:max-w-[600px] font-['Courier_New',monospace]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-normal font-['Courier_New',monospace]">
            orbits
          </DialogTitle>
        </DialogHeader>

        <div className="modal-inner-content space-y-4 font-['Courier_New',monospace]">
          <p className="text-base">/////////////////////////////////////////</p>

          <p className="text-base">
            Orbits is a stochastic drum machine that runs in the browser. It
            will always be free to use. It is designed to be user friendly for
            beginners and inspiring for experienced musicians.
          </p>

          <p className="text-base">
            To get started, generate a unique rhythm by clicking the
            &apos;random&apos; button at the top of the page.
          </p>

          <p className="text-base">/////////////////////////////////////////</p>

          <h2 className="text-2xl font-normal pt-2">controls</h2>

          <div className="space-y-2">
            <p className="text-base">
              density: Change the number of hits in the pattern
            </p>
            <p className="text-base">hide: Change the length of the pattern</p>
            <p className="text-base">
              random: Generate a unique pattern at the push of a button
            </p>
            <p className="text-base">length: Change the length of a drum hit</p>
            <p className="text-base">tune: Change the tuning of a drum hit</p>
            <p className="text-base">tempo: Change speed of playback</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
