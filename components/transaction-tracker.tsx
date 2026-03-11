"use client";

import { useState, useEffect, useRef } from "react";
import {
  Network,
  OperationTracker,
  SimplifiedStatuses,
  type TransactionLinker,
} from "@tonappchain/sdk";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, Search } from "lucide-react";

interface TransactionTrackerProps {
  transactionLinker: TransactionLinker | null;
  network?: Network;
  onClose: () => void;
}

export function TransactionTracker({
  transactionLinker,
  network = Network.TESTNET,
  onClose,
}: TransactionTrackerProps) {
  const [status, setStatus] = useState<SimplifiedStatuses | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [operationId, setOperationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track cleanup
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!transactionLinker) return;

    const trackTransaction = async () => {
      if (!mountedRef.current) return;

      setIsTracking(true);
      setError(null);
      setStatus(null);
      setOperationId(null);

      try {
        const tracker = new OperationTracker(network);

        // First, try to get the operation ID (may not be available immediately)
        let opId: string | null = null;
        let attempts = 0;
        const maxAttempts = 12; // 1 minute with 5s intervals

        while (!opId && attempts < maxAttempts && mountedRef.current) {
          try {
            opId = await tracker.getOperationId(transactionLinker);
            if (opId && mountedRef.current) {
              setOperationId(opId);
              break;
            }
          } catch (err) {
            console.warn(
              `Attempt ${attempts + 1} to get operation ID failed:`,
              err
            );
          }

          if (!opId && mountedRef.current) {
            await new Promise((resolve) => {
              timeoutRef.current = setTimeout(resolve, 5000);
            });
            attempts++;
          }
        }

        if (!opId) {
          if (mountedRef.current) {
            setError("Operation ID not found after multiple attempts");
            setIsTracking(false);
          }
          return;
        }

        // Now poll for status using the TransactionLinker (not the opId)
        const pollStatus = async (): Promise<void> => {
          if (!mountedRef.current) return;

          try {
            console.log("Polling status for operation:", opId);
            const currentStatus = await tracker.getSimplifiedOperationStatus(
              transactionLinker
            );
            console.log("Got status:", currentStatus);

            if (!mountedRef.current) return;

            // Validate that we got a real status, not undefined/null
            if (currentStatus === null || currentStatus === undefined) {
              throw new Error("Received null/undefined status from API");
            }

            setStatus(currentStatus);

            if (currentStatus === SimplifiedStatuses.PENDING) {
              timeoutRef.current = setTimeout(pollStatus, 5000);
            } else {
              setIsTracking(false);
            }
          } catch (err) {
            if (mountedRef.current) {
              console.error("Error polling transaction status:", err);
              setError(
                err instanceof Error ? err.message : "Failed to poll status"
              );
              setIsTracking(false);
            }
          }
        };

        await pollStatus();
      } catch (err) {
        if (mountedRef.current) {
          console.error("Error tracking transaction:", err);
          setError(
            err instanceof Error ? err.message : "Failed to track transaction"
          );
          setIsTracking(false);
        }
      }
    };

    trackTransaction();
  }, [transactionLinker, network]);

  if (!transactionLinker) return null;

  const getStatusIcon = () => {
    if (error) return <XCircle className="w-5 h-5 text-red-500" />;

    switch (status) {
      case SimplifiedStatuses.SUCCESSFUL:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case SimplifiedStatuses.FAILED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case SimplifiedStatuses.PENDING:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case SimplifiedStatuses.OPERATION_ID_NOT_FOUND:
        return <Search className="w-5 h-5 text-gray-500" />;
      default:
        return <Search className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    if (error) return "Tracking Error";

    switch (status) {
      case SimplifiedStatuses.SUCCESSFUL:
        return "Transaction Successful";
      case SimplifiedStatuses.FAILED:
        return "Transaction Failed";
      case SimplifiedStatuses.PENDING:
        return "Transaction Pending";
      case SimplifiedStatuses.OPERATION_ID_NOT_FOUND:
        return "Operation Not Found";
      default:
        return operationId
          ? "Tracking Transaction..."
          : "Looking for Operation...";
    }
  };

  const getStatusColor = () => {
    if (error) return "text-red-700 bg-red-50 border-red-200";

    switch (status) {
      case SimplifiedStatuses.SUCCESSFUL:
        return "text-green-700 bg-green-50 border-green-200";
      case SimplifiedStatuses.FAILED:
        return "text-red-700 bg-red-50 border-red-200";
      case SimplifiedStatuses.PENDING:
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case SimplifiedStatuses.OPERATION_ID_NOT_FOUND:
        return "text-orange-700 bg-orange-50 border-orange-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onClose();
  };

  const canClose = !isTracking || status !== SimplifiedStatuses.PENDING;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transaction Status</h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            ×
          </Button>
        </div>

        <div
          className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-medium">{getStatusText()}</p>
            {error && <p className="text-sm opacity-75 mt-1">{error}</p>}
            {operationId && !error && (
              <p className="text-sm opacity-75 mt-1">
                ID: {operationId.slice(0, 8)}...{operationId.slice(-8)}
              </p>
            )}
          </div>
        </div>

        {status === SimplifiedStatuses.PENDING && !error && (
          <p className="text-sm text-gray-600 mt-3 text-center">
            This may take a few minutes to complete...
          </p>
        )}

        {status === SimplifiedStatuses.OPERATION_ID_NOT_FOUND && (
          <p className="text-sm text-gray-600 mt-3 text-center">
            Transaction may still be propagating. Try again in a moment.
          </p>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={!canClose}
          >
            {canClose ? "Close" : "Tracking..."}
          </Button>
          {operationId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(operationId)}
            >
              Copy ID
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
