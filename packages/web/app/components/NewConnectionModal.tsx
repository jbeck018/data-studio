import { Dialog, Transition } from "@headlessui/react";
import { Form } from "@remix-run/react";
import { Fragment } from "react";
import { Button } from "./ui/button";

interface NewConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewConnectionModal({ isOpen, onClose }: NewConnectionModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-light-bg-primary dark:bg-dark-bg-secondary p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium mb-4">
                  New Database Connection
                </Dialog.Title>

                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="create" />

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Connection Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="host" className="block text-sm font-medium mb-1">
                      Host
                    </label>
                    <input
                      type="text"
                      id="host"
                      name="host"
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="port" className="block text-sm font-medium mb-1">
                      Port
                    </label>
                    <input
                      type="number"
                      id="port"
                      name="port"
                      defaultValue={5555}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="database" className="block text-sm font-medium mb-1">
                      Database Name
                    </label>
                    <input
                      type="text"
                      id="database"
                      name="database"
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ssl"
                      name="ssl"
                      className="h-4 w-4 rounded border-light-border dark:border-dark-border text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="ssl" className="ml-2 block text-sm">
                      Use SSL
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <Button
                      type="button"
                      className="px-4 py-2 text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Create Connection
                    </Button>
                  </div>
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
